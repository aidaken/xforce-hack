const {readFileSync,existsSync} = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const memory = new Map(), registry = new Map();
class Element {
  attachShadow(){ this.shadowRoot={addEventListener(){},querySelector:()=>null,innerHTML:''}; }
  getAttribute(){return null;}
  dispatchEvent(e){(this.events ||= []).push(e);}
}
const context = vm.createContext({HTMLElement:Element,CustomEvent:class{constructor(type,init){this.type=type;Object.assign(this,init);}},customElements:{get:n=>registry.get(n),define:(n,c)=>registry.set(n,c)},sessionStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},window:{}});
const base=existsSync('dist/components/reading-coach.js')?'dist/components/':'public/study-activities/components/';
vm.runInContext(readFileSync(base+'reading-coach.js','utf8'),context);
vm.runInContext(readFileSync(base+'reading-coach-sample.js','utf8'),context);
const Coach=registry.get('reading-coach'), lesson=context.window.unfoldSampleLesson;
const c=new Coach();c.lesson=lesson;
const invalid=JSON.parse(JSON.stringify(lesson));invalid.sections[0].quote='unsupported quote';
assert.throws(()=>{c.lesson=invalid;},/matching source quote/);
c.act('check');c.act('answer');assert.equal(c.state.stage,'check','no answer must not advance');
c.shadowRoot.querySelector=q=>q.includes(':checked')?{value:'0'}:null;
c.act('answer');assert.equal(c.state.correct,false);assert.equal(c.state.adapted,true);
c.act('next');assert.equal(c.state.outcomes[0],'reviewed');
c.act('next');assert.equal(c.state.index,1,'stale Next cannot complete another section');
const resumed=new Coach();resumed.lesson=lesson;assert.equal(resumed.resume,true);assert.equal(resumed.state.index,1);
resumed.act('resume');resumed.act('skip');assert.equal(resumed.state.outcomes[1],'skipped');
resumed.act('check');resumed.shadowRoot.querySelector=q=>q.includes(':checked')?{value:'0'}:null;
resumed.act('answer');resumed.act('next');assert.equal(resumed.state.outcomes[2],'checked');assert.equal(resumed.state.stage,'recall');
resumed.act('finish');resumed.act('finish');assert.equal(resumed.events.filter(x=>x.type==='reading-completed').length,1);
const completed=new Coach();completed.lesson=lesson;assert.equal(completed.state.stage,'done');assert.equal(completed.events,undefined,'restore must not re-award completion');
memory.set(completed.key,'{"index":999}');const corrupt=new Coach();corrupt.lesson=lesson;assert.equal(corrupt.state.index,0);
context.sessionStorage.setItem=()=>{throw Error('blocked');};corrupt.act('adapt');assert.equal(corrupt.storageAvailable,false);assert.equal(corrupt.state.adapted,true);
console.log('PASS: source validation, unanswered check, corrective adaptation, stale action, resume, skip distinction, correct answer, single completion, no replay, corrupt/blocked storage');

/* Drop-in physics toy: <study-ball>. No libraries or external requests. */
(() => {
  if (customElements.get('study-ball')) return;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  class StudyBall extends HTMLElement {
    static advance(s,dt,w,h,r=30) {
      const floor=Math.max(r,h-r),right=Math.max(r,w-r);
      s.vy+=1450*dt;
      const air=Math.exp(-.12*dt);s.vx*=air;s.vy*=air;
      s.x+=s.vx*dt;s.y+=s.vy*dt;
      let impact=0;
      if(s.x<r){s.x=r;impact=Math.abs(s.vx);s.vx=Math.abs(s.vx)*.84}
      if(s.x>right){s.x=right;impact=Math.abs(s.vx);s.vx=-Math.abs(s.vx)*.84}
      if(s.y<r){s.y=r;impact=Math.max(impact,Math.abs(s.vy));s.vy=Math.abs(s.vy)*.82}
      if(s.y>=floor){s.y=floor;impact=Math.max(impact,Math.abs(s.vy));s.vy=Math.abs(s.vy)<85?0:-Math.abs(s.vy)*.76;s.vx*=Math.exp(-2.8*dt);if(Math.abs(s.vx)<7)s.vx=0}
      s.angle+=s.vx*dt/r*180/Math.PI;
      s.sleep=s.y===floor&&s.vy===0&&s.vx===0;
      return impact;
    }
    constructor(){
      super();this.attachShadow({mode:'open'});this.radius=30;this.frame=0;this.dragging=false;this.paused=false;this.hiddenBall=false;this.state={x:0,y:0,vx:0,vy:0,angle:0,sleep:false};this.samples=[];
      this.shadowRoot.innerHTML=`<style>
      :host{position:fixed;inset:0;z-index:950;pointer-events:none;font:14px/1.5 Arial,sans-serif;color:#25463a;--study-ball-color:#e7a047}*{box-sizing:border-box}[hidden]{display:none!important}button{font:inherit;cursor:pointer}button:focus-visible{outline:3px solid #285d4c;outline-offset:5px}.ball{position:absolute;left:0;top:0;width:60px;height:60px;padding:0;border:0;border-radius:50%;pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;background:none;will-change:transform}.ball.dragging{cursor:grabbing}.skin{display:block;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 30% 25%,#fff4bd 0%,var(--study-ball-color) 42%,#b55c22 100%);box-shadow:inset -5px -7px 12px #74370c44,inset 2px 3px 5px #ffffff70,0 6px 9px #263e2a22;position:relative;overflow:hidden}.skin:after{content:'';position:absolute;inset:8px 22px;border-left:2px solid #85532355;border-right:2px solid #85532355;border-radius:50%;transform:rotate(-28deg)}.skin:before{content:'';position:absolute;left:0;right:0;top:29px;border-top:2px solid #85532344;transform:rotate(-28deg)}.ground{position:absolute;bottom:1px;left:0;width:58px;height:9px;border-radius:50%;background:#20392822;filter:blur(3px);will-change:transform;pointer-events:none}.dock{position:absolute;bottom:max(18px,env(safe-area-inset-bottom));left:18px;pointer-events:auto;display:flex;gap:3px;align-items:center;padding:6px;background:#fff;border:1px solid #d5dfd1;border-radius:28px;box-shadow:0 5px 20px #203b2420}.dock button{border:0;border-radius:20px;background:transparent;color:#36513f;padding:8px 11px;min-height:36px;font-size:13px}.dock button:hover{background:#edf3e4}.dock .label{font-weight:700;color:#825020}.hint{position:absolute;right:90px;top:135px;max-width:230px;background:#fff;border:1px solid #dbe3d4;border-radius:12px;padding:12px 16px;box-shadow:0 5px 20px #25392b12;font-size:13px;pointer-events:none}.hint strong{display:block;font-size:14px;margin-bottom:3px}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}@media(max-width:600px){.dock{bottom:76px;left:12px}.hint{right:82px;top:112px;max-width:190px}}
      </style><div class="ground" aria-hidden="true"></div><button class="ball" aria-label="Bouncy ball. Drag and release to throw. Arrow keys throw; Space pauses; R resets." aria-describedby="ball-help"><span class="skin" aria-hidden="true"></span></button><div class="hint"><strong>A little bounce break.</strong>Grab the ball and give it a throw.</div><div class="dock" role="group" aria-label="Bouncy ball controls"><button class="label" title="Toss the ball">● Toss</button><button class="pause" aria-pressed="false">Pause</button><button class="reset">Reset</button><button class="hide">Hide</button></div><span id="ball-help" class="sr">Drag to throw. Arrow keys launch the ball. Space pauses or resumes. R resets it.</span><span class="sr status" role="status"></span>`;
      this.ball=this.shadowRoot.querySelector('.ball');this.skin=this.shadowRoot.querySelector('.skin');
      this.ball.addEventListener('pointerdown',e=>this.grab(e));this.ball.addEventListener('pointermove',e=>this.move(e));this.ball.addEventListener('pointerup',e=>this.release(e));this.ball.addEventListener('pointercancel',()=>this.cancelDrag());this.ball.addEventListener('lostpointercapture',()=>{if(this.dragging)this.cancelDrag()});
      this.ball.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','r','R'].includes(e.key)){e.preventDefault();if(e.key===' ')this.pause();else if(e.key.toLowerCase()==='r')this.reset();else{const velocity={ArrowLeft:[-1100,-650],ArrowRight:[1100,-650],ArrowUp:[200,-1250],ArrowDown:[150,900]}[e.key];this.toss(...velocity)}}});
      this.q('.label').onclick=()=>this.toss();this.q('.pause').onclick=()=>this.pause();this.q('.reset').onclick=()=>this.reset();this.q('.hide').onclick=()=>this.toggleHidden();
      this.onResize=()=>{this.measure();this.state.x=clamp(this.state.x,this.radius,this.width-this.radius);this.state.y=clamp(this.state.y,this.radius,this.height-this.radius);this.state.sleep=false;this.paint();this.wake()};
      this.onVisibility=()=>{if(document.hidden){this.stop();this.cancelDrag()}else this.wake()};
    }
    q(s){return this.shadowRoot.querySelector(s)}
    connectedCallback(){this.measure();this.paused=matchMedia('(prefers-reduced-motion: reduce)').matches;this.updatePause();this.reset();window.addEventListener('resize',this.onResize);document.addEventListener('visibilitychange',this.onVisibility)}
    disconnectedCallback(){this.stop();clearTimeout(this.hintTimer);window.removeEventListener('resize',this.onResize);document.removeEventListener('visibilitychange',this.onVisibility)}
    measure(){this.width=Math.max(60,this.clientWidth);this.height=Math.max(60,this.clientHeight)}
    dismissHint(){this.q('.hint').hidden=true}
    reset(){this.cancelDrag();this.measure();this.state={x:Math.max(30,this.width-70),y:Math.min(165,this.height/3),vx:0,vy:0,angle:0,sleep:false};this.squash=0;this.paint();this.wake();this.q('.status').textContent='Ball reset.'}
    wake(){if(!this.frame&&!this.paused&&!this.hiddenBall&&!this.dragging&&!document.hidden&&this.isConnected){this.lastTime=0;this.accumulator=0;this.frame=requestAnimationFrame(t=>this.tick(t))}}
    stop(){cancelAnimationFrame(this.frame);this.frame=0;this.lastTime=0;this.accumulator=0}
    tick(time){this.frame=0;if(this.paused||this.hiddenBall||this.dragging||document.hidden)return;if(!this.lastTime)this.lastTime=time;const elapsed=Math.min((time-this.lastTime)/1000,.05);this.lastTime=time;this.accumulator+=elapsed;while(this.accumulator>=1/120){const previous={x:this.state.x,y:this.state.y};const impact=this.advancePhysics?this.advancePhysics(this.state,1/120,this.width,this.height,this.radius):StudyBall.advance(this.state,1/120,this.width,this.height,this.radius);this.afterPhysics?.(previous,1/120);if(impact>130)this.squash=Math.min(.19,impact/7000);this.accumulator-=1/120}this.squash=Math.max(0,(this.squash||0)-elapsed*1.8);this.paint();if(!this.state.sleep||this.squash>0)this.frame=requestAnimationFrame(t=>this.tick(t));}
    paint(){const s=this.state;this.ball.style.transform='translate('+ (s.x-30)+'px,'+(s.y-30)+'px)';this.skin.style.transform='rotate('+s.angle+'deg) scale('+(1+(this.squash||0))+','+(1-(this.squash||0))+')';const altitude=clamp((this.height-s.y)/this.height,0,1);this.q('.ground').style.transform='translateX('+(s.x-29)+'px) scale('+(1-altitude*.65)+')';this.q('.ground').style.opacity=String(1-altitude*.8)}
    grab(e){if(e.button!==0)return;e.preventDefault();this.dismissHint();this.stop();this.dragging=true;this.pointer=e.pointerId;this.offsetX=e.clientX-this.state.x;this.offsetY=e.clientY-this.state.y;this.state.vx=0;this.state.vy=0;this.squash=0;this.samples=[{x:e.clientX,y:e.clientY,t:performance.now()}];this.ball.classList.add('dragging');this.ball.setPointerCapture(e.pointerId);this.ball.focus({preventScroll:true})}
    move(e){if(!this.dragging||e.pointerId!==this.pointer)return;const now=performance.now();this.state.x=clamp(e.clientX-this.offsetX,30,this.width-30);this.state.y=clamp(e.clientY-this.offsetY,30,this.height-30);this.samples.push({x:e.clientX,y:e.clientY,t:now});this.samples=this.samples.filter(p=>now-p.t<=110);this.paint()}
    release(e){if(!this.dragging||e.pointerId!==this.pointer)return;const now=performance.now();const recent=this.samples.filter(p=>now-p.t<=110);const first=recent[0],last=recent[recent.length-1];let vx=0,vy=0;if(first&&last&&last.t>first.t&&now-last.t<75){const dt=Math.max(.016,(last.t-first.t)/1000);vx=clamp((last.x-first.x)/dt,-2400,2400);vy=clamp((last.y-first.y)/dt,-2400,2400)}this.dragging=false;this.ball.classList.remove('dragging');if(this.ball.hasPointerCapture(e.pointerId))this.ball.releasePointerCapture(e.pointerId);this.state.vx=vx;this.state.vy=vy;this.state.sleep=false;this.wake()}
    cancelDrag(){if(!this.dragging)return;this.dragging=false;this.ball.classList.remove('dragging');if(this.ball.hasPointerCapture(this.pointer))this.ball.releasePointerCapture(this.pointer);this.state.vx=0;this.state.vy=0;this.state.sleep=false;this.wake()}
    toss(vx=-850,vy=-1100){this.cancelDrag();this.dismissHint();if(this.hiddenBall)this.toggleHidden();this.paused=false;this.updatePause();this.state.vx=vx;this.state.vy=vy;this.state.sleep=false;this.wake()}
    pause(){this.paused=!this.paused;if(this.paused)this.stop();else this.wake();this.updatePause()}
    updatePause(){this.q('.pause').textContent=this.paused?'Resume':'Pause';this.q('.pause').setAttribute('aria-pressed',String(this.paused))}
    toggleHidden(){this.hiddenBall=!this.hiddenBall;this.ball.hidden=this.hiddenBall;this.q('.ground').hidden=this.hiddenBall;this.q('.hide').textContent=this.hiddenBall?'Show':'Hide';this.q('.pause').disabled=this.hiddenBall;this.q('.reset').disabled=this.hiddenBall;if(this.hiddenBall){this.cancelDrag();this.stop();this.dismissHint()}else{this.paint();this.wake()}}
  }
  customElements.define('study-ball',StudyBall);
})();

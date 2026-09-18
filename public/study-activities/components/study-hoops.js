/* Load after study-ball.js. <study-hoops> adds reading rewards to the ball. */
(() => {
  if(customElements.get('study-hoops'))return;
  const Ball=customElements.get('study-ball');
  if(!Ball)throw new Error('Load study-ball.js before study-hoops.js');
  class StudyHoops extends Ball {
    static observedAttributes=['sections-completed'];
    // Free throws use gentler gravity and basketball-like energy loss.
    static advanceShot(s,dt,w,h,r=30){
      const air=Math.exp(-.08*dt);s.vy=(s.vy+980*dt)*air;s.vx*=air;
      s.x+=s.vx*dt;s.y+=s.vy*dt;let impact=0;
      if(s.x<r||s.x>w-r){impact=Math.abs(s.vx);s.x=Math.max(r,Math.min(w-r,s.x));s.vx=s.x===r?Math.abs(s.vx)*.65:-Math.abs(s.vx)*.65}
      if(s.y<r){s.y=r;impact=Math.max(impact,Math.abs(s.vy));s.vy=Math.abs(s.vy)*.6}
      if(s.y>=h-r){s.y=h-r;impact=Math.max(impact,Math.abs(s.vy));s.vy=-Math.abs(s.vy)*.65}
      s.angle+=s.vx*dt/r*180/Math.PI;s.sleep=false;return impact;
    }
    advancePhysics(...args){return StudyHoops.advanceShot(...args)}
    static shotVelocity(start,hoop){
      const apex=Math.max(45,Math.min(hoop.y,start.y)-85);
      const time=Math.sqrt(2*(start.y-apex)/980)+Math.sqrt(2*(hoop.y-apex)/980);
      const dt=1/120,n=Math.max(1,Math.round(time/dt)),a=Math.exp(-.08*dt),sum=a*(1-Math.pow(a,n))/(1-a);
      return {vx:(hoop.x-start.x)/(dt*sum),vy:(hoop.y-start.y-980*dt*dt*a/(1-a)*(n-sum))/(dt*sum)};
    }
    static crossesRim(previous,current,hoop,r=30){
      if(current.vy<=0||previous.y>=hoop.y||current.y<hoop.y)return false;
      const t=(hoop.y-previous.y)/(current.y-previous.y);
      const x=previous.x+(current.x-previous.x)*t;
      return Math.abs(x-hoop.x)<=hoop.width/2-r*.7;
    }
    constructor(){
      super();this.throws=0;this.baskets=0;this.sections=0;this.inFlight=false;this.scored=false;this.particles=[];
      const style=document.createElement('style');style.textContent=`
      .dock{border-radius:16px;flex-wrap:wrap;width:min(355px,calc(100vw - 36px));gap:2px}.dock .label{color:#285d4c}.reward-summary{width:100%;padding:4px 10px 2px;display:flex;justify-content:space-between;font-size:12px;color:#566e5c}.reward-message{padding:2px 10px 7px;font-size:12px;line-height:1.5;width:100%}.dock .earn{background:#e7f0d7;border:1px solid #d1e0bc;border-radius:9px;font-size:12px;width:100%}.dock button:disabled{opacity:.45;cursor:default}.hoop{position:absolute;width:156px;height:139px;pointer-events:none}.board{position:absolute;top:0;left:6px;width:144px;height:89px;border:5px solid #356454;border-radius:8px;background:#f9fff3ed;box-shadow:0 3px 12px #25473920}.target{position:absolute;width:58px;height:44px;left:44px;top:28px;border:3px solid #d48b3d;border-bottom:0}.net{position:absolute;left:25px;top:80px;width:106px;height:62px;clip-path:polygon(0 0,100% 0,78% 100%,22% 100%);background:repeating-linear-gradient(65deg,transparent 0 13px,#547d6688 14px 16px,transparent 17px 25px),repeating-linear-gradient(-65deg,transparent 0 13px,#547d6688 14px 16px,transparent 17px 25px);border-bottom:3px solid #547d66}.rim{position:absolute;left:9px;top:72px;width:138px;height:16px;border:5px solid #e69b3f;border-radius:50%;background:#e5a65318;box-shadow:0 2px 2px #6b471a22}.hoop-label{position:absolute;top:-28px;left:0;width:100%;text-align:center;font-size:12px;font-weight:700;color:#285d4c;background:#f5f9eced;border-radius:20px;padding:3px}.confetti{position:absolute;width:9px;height:14px;pointer-events:none}.reward-toast{position:absolute;top:28px;left:50%;transform:translateX(-50%);padding:13px 22px;border:1px solid #c4d5a6;border-radius:30px;background:#f3f9e8;color:#285d4c;font-weight:700;box-shadow:0 8px 24px #1f42221c;white-space:nowrap}.ball[aria-disabled=true]{cursor:default;opacity:.6}@media(max-width:600px){.dock{bottom:76px;left:12px;width:min(330px,calc(100vw - 24px))}.hoop{transform:scale(.85);transform-origin:50% 80px}}
      `;this.shadowRoot.append(style);
      const basket=document.createElement('div');basket.className='hoop';basket.hidden=true;basket.setAttribute('aria-hidden','true');basket.innerHTML='<div class="hoop-label">TAKE A SHOT</div><div class="board"><div class="target"></div></div><div class="net"></div><div class="rim"></div>';this.shadowRoot.insertBefore(basket,this.ball);
      this.q('.hint').hidden=true;
      this.q('.dock').insertAdjacentHTML('afterbegin','<div class="reward-summary"><span class="sections">0 sections finished</span><strong class="score">0 baskets</strong></div>');
      this.q('.dock').insertAdjacentHTML('beforeend','<div class="reward-message" role="status">Finish a reading section to earn a throw.</div><button class="earn">＋ Section finished · demo</button>');
      const toast=document.createElement('div');toast.className='reward-toast';toast.hidden=true;toast.setAttribute('role','status');this.shadowRoot.append(toast);
      this.q('.earn').onclick=()=>this.setSectionsCompleted(this.sections+1);
      this.q('.label').onclick=()=>this.assistedShot();
      this.ball.setAttribute('aria-label','Basketball. Drag and release to use one earned throw. Arrow keys shoot; Space pauses; R resets.');
      this.q('#ball-help').textContent='Finish a section to earn a throw. Drag and release to shoot. The Shoot button offers an assisted shot. Reset ends the current attempt without refunding it.';
      this.q('.reset').title='Reset ball; an active throw is not refunded';
    }
    connectedCallback(){super.connectedCallback();this.setSectionsCompleted(this.getAttribute('sections-completed')||0);this.refreshRewards()}
    disconnectedCallback(){super.disconnectedCallback();clearTimeout(this.toastTimer);this.clearConfetti()}
    attributeChangedCallback(name,old,value){if(old!==value&&this.q('.sections'))this.setSectionsCompleted(value)}
    measure(){super.measure();const scale=this.width<=600?.85:1;this.hoop={x:Math.min(this.width-88,this.width*.70),y:Math.max(150,Math.min(this.height*.30,this.height-250)),width:138*scale};if(this.q('.hoop')){this.q('.hoop').style.left=(this.hoop.x-78)+'px';this.q('.hoop').style.top=(this.hoop.y-80)+'px'}}
    setSectionsCompleted(value){const next=Number(value);if(!Number.isSafeInteger(next)||next<0)return false;const added=Math.max(0,next-this.sections);if(added){this.sections=next;this.throws+=added;if(!this.inFlight&&!this.dragging)this.reset();this.message(`Nice progress! ${added} ${added===1?'throw':'throws'} earned.`);this.refreshRewards();this.dispatchEvent(new CustomEvent('throws-earned',{detail:{added,throws:this.throws,sections:this.sections},bubbles:true,composed:true}))}return true}
    message(text){this.q('.reward-message').textContent=text}
    reset(){this.stop();this.cancelDrag();this.inFlight=false;this.measure();this.state={x:Math.max(50,this.width*.38),y:Math.max(this.hoop.y+100,Math.min(this.height*.65,this.height-240)),vx:0,vy:0,angle:0,sleep:true};this.state.y=Math.min(this.height-30,this.state.y);this.squash=0;this.paint();if(this.q('.sections'))this.refreshRewards()}
    wake(){if(this.inFlight)super.wake()}
    refreshRewards(){if(!this.q('.sections'))return;this.q('.sections').textContent=`${this.sections} section${this.sections===1?'':'s'} finished`;this.q('.score').textContent=`${this.baskets} basket${this.baskets===1?'':'s'}`;this.q('.label').textContent=`Shoot · ${this.throws} left`;this.q('.label').title='Assisted shot — uses one throw';this.q('.label').disabled=this.throws===0||this.inFlight;this.ball.setAttribute('aria-disabled',String(this.throws===0||this.inFlight));this.q('.hoop').hidden=this.hiddenBall||(!this.throws&&!this.inFlight);}
    grab(e){if(this.throws===0||this.inFlight){this.message(this.inFlight?'Let this shot finish, or reset the ball.':'Finish a section to earn your next throw.');return}this.dragOrigin={...this.state};super.grab(e)}
    cancelDrag(){const was=this.dragging;super.cancelDrag();if(was&&!this.inFlight){this.state.sleep=true;this.stop()}}
    release(e){if(!this.dragging||e.pointerId!==this.pointer)return;const dx=this.state.x-this.dragOrigin.x,dy=this.state.y-this.dragOrigin.y;const moved=Math.hypot(dx,dy);super.release(e);if(moved<8){this.state.sleep=true;this.message('Swipe up toward the basket, then release. A gentle throw is enough.');return}
      // Keep the throw physical, but help upward gestures aimed toward the rim.
      // Slow drags also work: exact release timing should not decide the reward.
      const ideal=StudyHoops.shotVelocity(this.state,this.hoop);
      if(dy<-8&&dx*(this.hoop.x-this.dragOrigin.x)>=-100){
        const rawSpeed=Math.hypot(this.state.vx,this.state.vy);
        const blend=(raw,target)=>target*.75+Math.max(target-Math.abs(target)*.12,Math.min(target+Math.abs(target)*.12,raw))*.25;
        this.state.vx=rawSpeed<180?ideal.vx:blend(this.state.vx,ideal.vx);
        this.state.vy=rawSpeed<180?ideal.vy:blend(this.state.vy,ideal.vy);
      }
      this.beginShot()}
    beginShot(){if(!this.throws||this.inFlight)return;this.throws--;this.inFlight=true;this.scored=false;this.flightTime=0;this.paused=false;this.updatePause();this.state.sleep=false;this.message('Aim for the rim from above.');this.refreshRewards();this.wake()}
    toss(vx=-850,vy=-1100){if(this.throws===0||this.inFlight)return;this.cancelDrag();if(this.hiddenBall)this.toggleHidden();this.state.vx=vx;this.state.vy=vy;this.beginShot()}
    assistedShot(){if(!this.throws||this.inFlight)return;this.reset();if(this.hiddenBall)this.toggleHidden();const {vx,vy}=StudyHoops.shotVelocity(this.state,this.hoop);this.toss(vx,vy)}
    afterPhysics(previous,dt){if(!this.inFlight)return;this.flightTime+=dt;if(!this.scored&&StudyHoops.crossesRim(previous,this.state,this.hoop)){this.scored=true;this.baskets++;this.message('Swish! A little celebration for your progress.');this.celebrate();this.dispatchEvent(new CustomEvent('basket-scored',{detail:{baskets:this.baskets,throws:this.throws},bubbles:true,composed:true}));this.refreshRewards()}if(this.state.y>=this.height-30||this.flightTime>8){const scored=this.scored;this.inFlight=false;this.state.vx=0;this.state.vy=0;this.state.sleep=true;this.reset();this.message(scored?(this.throws?'Nice shot! You have another throw ready.':'Nice shot! Finish another section to earn a throw.'):(this.throws?'Close! Try your next throw.':'Good try. Finish another section for another throw.'));this.refreshRewards()}}
    toggleHidden(){super.toggleHidden();this.refreshRewards()}
    clearConfetti(){this.particles.forEach(p=>{p.animation.cancel();p.el.remove()});this.particles=[]}
    celebrate(){this.q('.reward-toast').hidden=false;this.q('.reward-toast').textContent='✦ Swish! You earned that.';clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>this.q('.reward-toast').hidden=true,2400);this.clearConfetti();if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('reduce-motion'))return;const colors=['#e5a347','#82ac77','#74aaca','#d87688','#b2a0ce'];for(let i=0;i<55;i++){const el=document.createElement('i');el.className='confetti';el.style.background=colors[i%colors.length];el.style.left=this.hoop.x+'px';el.style.top=this.hoop.y+'px';this.shadowRoot.append(el);const dx=(Math.random()-.65)*500,dy=-100-Math.random()*180;const animation=el.animate([{transform:'translate(0,0) rotate(0deg)',opacity:1},{transform:`translate(${dx*.6}px,${dy}px) rotate(${i*19}deg)`,opacity:1,offset:.4},{transform:`translate(${dx}px,${220+Math.random()*180}px) rotate(${i*43}deg)`,opacity:0}],{duration:1300+Math.random()*650,easing:'ease-out'});animation.onfinish=()=>el.remove();this.particles.push({el,animation})}}
  }
  customElements.define('study-hoops',StudyHoops);
})();

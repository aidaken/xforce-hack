/* Portable, dependency-free <study-video> component. See README.md. */
(() => {
  if (customElements.get('study-video')) return;
  let apiPromise;
  function youtubeAPI() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      const timer = setTimeout(() => { apiPromise = null; reject(new Error('YouTube took too long to load.')); }, 15000);
      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timer);
        resolve(window.YT);
        if (typeof previous === 'function') previous();
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.onerror = () => { clearTimeout(timer); script.remove(); apiPromise = null; reject(new Error('Could not connect to YouTube.')); };
        document.head.append(script);
      }
    });
    return apiPromise;
  }
  class StudyVideo extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode:'open'});
      this.player = null;
      this.ready = false;
      this.opened = false;
      this.generation = 0;
      this.shadowRoot.innerHTML = `<style>
        :host{position:fixed;bottom:max(18px,env(safe-area-inset-bottom));right:18px;z-index:1000;font:14px/1.5 Arial,sans-serif;color:#233e34;--study-video-accent:#285d4c} :host([corner="left"]){right:auto;left:18px} *{box-sizing:border-box} [hidden]{display:none!important} button,a{font:inherit} button{cursor:pointer;border:0} button:focus-visible,a:focus-visible{outline:3px solid #b3cf6e;outline-offset:3px} .launcher{display:flex;align-items:center;gap:10px;padding:12px 18px;background:var(--study-video-accent);color:white;border:1px solid #ffffff55;border-radius:30px;box-shadow:0 6px 24px #13392b30;font-weight:600;min-height:48px}.play-icon{display:grid;place-items:center;background:#ffffff20;width:26px;height:26px;border-radius:50%}.panel{width:min(360px,calc(100vw - 36px));background:#fff;border:1px solid #d4dfd5;border-radius:16px;overflow:hidden;box-shadow:0 14px 55px #18362d40;max-height:calc(100dvh - 36px);overflow-y:auto}.heading{display:flex;align-items:center;padding:12px 14px;gap:8px}.heading strong{font-size:14px}.heading small{display:block;font-size:12px;color:#68766e}.tools{display:flex;margin-left:auto;gap:3px}.icon{width:34px;height:34px;border-radius:7px;background:#f0f4ec;color:#294d3e;font-size:18px}.screen{background:#14271f;height:220px;position:relative}.screen iframe{width:100%;height:100%;border:0;display:block}.placeholder{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#e5efd9;gap:12px}.placeholder span{font-size:32px}.placeholder p{margin:0;font-size:14px}.start{background:#d9ebac;border-radius:8px;padding:10px 18px;color:#243b23;font-weight:600}.controls{display:flex;align-items:center;gap:8px;padding:12px 14px 0}.controls button{border:1px solid #d9e1d2;background:#f6f8f1;padding:7px 11px;border-radius:7px;min-height:38px;color:#284534;font-size:13px}.controls button:disabled{opacity:.5;cursor:default}.controls .move{margin-left:auto}.status{padding:10px 14px 0;margin:0;font-size:12px;color:#53645a;min-height:28px}.footer{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px 14px;color:#68766e;font-size:12px}.footer a{color:#3b624f;text-decoration:underline;font-size:12px}.retry{background:none;color:#285d4c;text-decoration:underline;font-size:13px;padding:8px 14px}.panel.wide{width:min(480px,calc(100vw - 36px))}.wide .screen{height:270px}@media(max-width:480px){:host{right:12px;bottom:12px}:host([corner="left"]){left:12px}.panel,.panel.wide{width:calc(100vw - 24px)}.wide .screen{height:220px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
      </style><button class="launcher" aria-expanded="false" aria-controls="video-panel"><span class="play-icon" aria-hidden="true">▶</span> Study sidekick</button>
      <section class="panel" id="video-panel" aria-label="Subway Surfers study video" hidden>
        <div class="heading"><div><strong>Subway Surfers</strong><small>A little gameplay on the side</small></div><div class="tools"><button class="icon resize" aria-label="Enlarge video" title="Resize video">⤢</button><button class="icon close" aria-label="Close and stop video" title="Close and stop">×</button></div></div>
        <div class="screen"><div class="placeholder"><span aria-hidden="true">▶</span><p>Ready when you are.</p><button class="start">Play gameplay</button></div></div>
        <div class="controls"><button class="toggle" disabled>Play</button><button class="mute" disabled aria-pressed="true">Unmute</button><button class="move" aria-label="Move player to bottom left" title="Switch corners">⇄ Move</button></div>
        <p class="status" role="status">Starts muted. Loads from YouTube when you press play.</p><button class="retry" hidden>Retry video</button><div class="footer"><span>Optional study activity</span><a class="source" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a></div>
      </section>`;
      this.find('.launcher').onclick=()=>this.open();
      this.find('.close').onclick=()=>this.close();
      this.find('.start').onclick=()=>this.start();
      this.find('.retry').onclick=()=>this.start();
      this.find('.toggle').onclick=()=>{if(this.ready){this.player.getPlayerState()===1?this.player.pauseVideo():this.player.playVideo();}};
      this.find('.mute').onclick=()=>{if(this.ready){this.player.isMuted()?this.player.unMute():this.player.mute();this.syncMute();}};
      this.find('.move').onclick=()=>{const left=this.getAttribute('corner')!=='left';this.setAttribute('corner',left?'left':'right');this.find('.move').setAttribute('aria-label','Move player to bottom '+(left?'right':'left'));};
      this.find('.resize').onclick=()=>{const large=this.find('.panel').classList.toggle('wide');this.find('.resize').setAttribute('aria-label',large?'Shrink video':'Enlarge video');};
      this.shadowRoot.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.opened){e.stopPropagation();this.close();}});
    }
    find(selector){return this.shadowRoot.querySelector(selector)}
    connectedCallback(){this.find('.source').href='https://www.youtube.com/watch?v='+encodeURIComponent(this.videoId)}
    disconnectedCallback(){this.destroy()}
    get videoId(){const id=this.getAttribute('video-id')||'7ghSziUQnhs';return /^[\w-]{11}$/.test(id)?id:'7ghSziUQnhs'}
    open(){this.opened=true;this.find('.panel').hidden=false;this.find('.launcher').hidden=true;this.find('.launcher').setAttribute('aria-expanded','true');this.find('.close').focus()}
    close(){this.opened=false;this.destroy();this.find('.panel').hidden=true;this.find('.launcher').hidden=false;this.find('.launcher').setAttribute('aria-expanded','false');this.find('.launcher').focus();this.resetScreen()}
    destroy(){this.generation++;clearTimeout(this.readyTimer);this.player?.destroy();this.player=null;this.ready=false}
    resetScreen(){this.find('.screen').innerHTML='<div class="placeholder"><span aria-hidden="true">▶</span><p>Ready when you are.</p><button class="start">Play gameplay</button></div>';this.find('.start').onclick=()=>this.start();this.find('.toggle').disabled=true;this.find('.mute').disabled=true;this.find('.retry').hidden=true;this.find('.status').textContent='Starts muted. Loads from YouTube when you press play.'}
    fail(message){clearTimeout(this.readyTimer);this.find('.status').textContent=message+' Retry or use Watch on YouTube.';this.find('.retry').hidden=false;this.find('.toggle').disabled=true;this.find('.mute').disabled=true;this.ready=false}
    syncMute(){const muted=this.player.isMuted();this.find('.mute').textContent=muted?'Unmute':'Mute';this.find('.mute').setAttribute('aria-pressed',String(muted))}
    async start(){
      this.destroy();const generation=this.generation;this.find('.retry').hidden=true;this.find('.toggle').disabled=true;this.find('.mute').disabled=true;
      this.find('.status').textContent='Connecting to YouTube…';this.find('.screen').innerHTML='<div class="placeholder"><p>Loading gameplay…</p></div>';
      try{
        const YT=await youtubeAPI();if(generation!==this.generation||!this.isConnected||!this.opened)return;
        const mount=document.createElement('div');this.find('.screen').replaceChildren(mount);
        this.readyTimer=setTimeout(()=>this.fail('The player did not respond.'),20000);
        this.player=new YT.Player(mount,{host:'https://www.youtube-nocookie.com',width:'100%',height:'100%',videoId:this.videoId,playerVars:{playsinline:1,controls:1,rel:0,loop:1,playlist:this.videoId,...(location.protocol.startsWith('http')?{origin:location.origin}:{})},events:{
          onReady:e=>{if(generation!==this.generation)return;clearTimeout(this.readyTimer);this.ready=true;e.target.getIframe().title='Subway Surfers gameplay';e.target.mute();this.syncMute();this.find('.toggle').disabled=false;this.find('.mute').disabled=false;this.find('.status').textContent='Ready. Press play if playback does not start.';e.target.playVideo()},
          onStateChange:e=>{if(generation!==this.generation)return;this.find('.toggle').textContent=e.data===1?'Pause':'Play';if(e.data===1)this.find('.status').textContent='Playing · Close stops the video.';if(e.data===2)this.find('.status').textContent='Paused · Pick up whenever you like.';if(this.ready)this.syncMute()},
          onAutoplayBlocked:()=>{this.find('.status').textContent='Press Play to begin.'},
          onError:()=>{if(generation===this.generation)this.fail('YouTube could not play this video here.')}
        }});
      }catch(error){if(generation===this.generation)this.fail(error.message)}
    }
  }
  customElements.define('study-video',StudyVideo);
})();

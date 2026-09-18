/* Portable wandering companion: <addy-pet>. Images resolve relative to this script.
 *
 *   <script src="components/addy-pet.js" defer></script>
 *   <addy-pet></addy-pet>
 *
 * Addy walks to random points across the viewport, pauses in a pose, turns
 * around, and keeps going. She lives *behind* the page: content paints over
 * her, and she can be grabbed wherever she shows through (gutters, gaps,
 * plain text). Pointer down lifts her, drag moves her, release drops her.
 *
 * Put the tag inside the element whose background she should walk on (the
 * app root, or <body>). She sits between that element's background and its
 * content; the element is made a stacking context if it is not one already.
 *
 * Attributes: size (px width, default 120), speed (px/s, default 100),
 *             paused, assets (base URL for the art; default assets/addy/).
 * Methods:    pause(), resume(), goTo(x, y). Property: state.
 * Art:        walk1-6.png (8 fps cycle), pointing/thinking (idle, random),
 *             celebrating/thinking (while held, random). All face right;
 *             walking left is a CSS flip.
 *
 * No libraries, no network calls beyond the images.
 */
(() => {
  if (customElements.get('addy-pet')) return;
  const root = new URL('.', document.currentScript.src);
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const INTERACTIVE = 'a,button,input,select,textarea,label,summary,dialog,[role=button],[contenteditable]';

  class AddyPet extends HTMLElement {
    static get observedAttributes() { return ['size', 'speed', 'paused']; }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `<style>
      :host{display:contents}
      .pet{position:fixed;left:0;top:0;z-index:-1;cursor:grab;will-change:transform;user-select:none;-webkit-user-select:none;filter:drop-shadow(0 8px 6px #0000002e)}
      .pet.carried{cursor:grabbing}
      .body{position:relative;width:100%;height:100%;transform-origin:50% 100%}
      .body img{position:absolute;inset:0;width:100%;height:auto;display:none;pointer-events:none}
      .body img.on{display:block}
      .flip .body{transform:scaleX(-1)}
      .walking .body{animation:bob .5s ease-in-out infinite}
      .walking.flip .body{animation:bob-flip .5s ease-in-out infinite}
      .idle .body{animation:breathe 3s ease-in-out infinite}
      .idle.flip .body{animation:breathe-flip 3s ease-in-out infinite}
      .carried .body{transform-origin:50% 0;animation:dangle 1.4s ease-in-out infinite}
      .carried.flip .body{animation:dangle-flip 1.4s ease-in-out infinite}
      .landing .body{animation:land .32s ease-out 1}
      .landing.flip .body{animation:land-flip .32s ease-out 1}
      @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4%)}}
      @keyframes bob-flip{0%,100%{transform:scaleX(-1) translateY(0)}50%{transform:scaleX(-1) translateY(-4%)}}
      @keyframes breathe{0%,100%{transform:scale(1,1)}50%{transform:scale(1.02,.98)}}
      @keyframes breathe-flip{0%,100%{transform:scale(-1,1)}50%{transform:scale(-1.02,.98)}}
      @keyframes dangle{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
      @keyframes dangle-flip{0%,100%{transform:scaleX(-1) rotate(-7deg)}50%{transform:scaleX(-1) rotate(7deg)}}
      @keyframes land{0%{transform:scale(1.15,.8)}50%{transform:scale(.95,1.06)}100%{transform:scale(1,1)}}
      @keyframes land-flip{0%{transform:scaleX(-1.15) scaleY(.8)}50%{transform:scaleX(-.95) scaleY(1.06)}100%{transform:scaleX(-1) scaleY(1)}}
      </style><div class="pet idle" role="img" aria-label="Addy the alpaca wandering behind the page. Drag to move her."><div class="body"></div></div>`;
      this.el = this.shadowRoot.querySelector('.pet');
      this.body = this.shadowRoot.querySelector('.body');
      this.x = 0; this.y = 0; this.facing = 1; this.state = 'idle';
      this.target = null; this.idleUntil = 0; this.grab = null;
      this.imgs = new Map(); this.cur = null; this.frame = 0; this.frameAcc = 0; this.raf = 0;

      this.onDown = e => this.pointerDown(e);
      this.onMove = e => this.pointerMove(e);
      this.onUp = () => this.release();
      this.onTouch = e => { if (this.grab) e.preventDefault(); };
      this.onResize = () => { this.keepInside(); this.place(); };
      this.onVisibility = () => { if (document.hidden) this.stop(); else this.wake(); };
    }

    // ---------- attributes ----------
    get size() { return +this.getAttribute('size') || 120; }
    get speed() { return +this.getAttribute('speed') || 100; }
    get paused() { return this.hasAttribute('paused'); }
    attributeChangedCallback(name) {
      if (!this.isConnected) return;
      if (name === 'size') { this.el.style.width = this.size + 'px'; this.fitHeight(); }
      if (name === 'paused') { if (this.paused) this.setState('idle'); else this.wake(); }
    }
    pause() { this.setAttribute('paused', ''); }
    resume() { this.removeAttribute('paused'); }
    goTo(x, y) { this.target = { x, y }; this.face(x >= this.x ? 1 : -1); this.setState('walking'); this.wake(); }

    // ---------- lifecycle ----------
    connectedCallback() {
      const base = new URL(this.getAttribute('assets') || 'assets/addy/', root);
      const art = n => new URL(n + '.png', base).href;
      const pose = n => ({ frames: [art(n)], fps: 1 });
      this.anims = {
        walk: [{ frames: [1, 2, 3, 4, 5, 6].map(i => art('walk' + i)), fps: 8 }],
        idle: [pose('pointing'), pose('thinking')],
        carried: [pose('celebrating'), pose('thinking')],
      };
      for (const list of Object.values(this.anims)) for (const a of list) for (const url of a.frames) this.imgFor(url);
      this.el.style.width = this.size + 'px';
      this.el.style.height = this.size + 'px';
      this.h = this.size;
      this.useAnim(this.animFor('idle'));

      // z-index:-1 paints above the *nearest stacking context's* background
      // and below its content. Make the parent that context so she shows on
      // its background instead of vanishing behind it.
      const host = this.parentElement;
      if (host && host !== document.body && getComputedStyle(host).isolation === 'auto') host.style.isolation = 'isolate';

      this.x = rand(8, this.vw() - this.size - 8);
      this.y = this.vh() - this.size - 40;
      this.place();
      this.idleUntil = performance.now() + rand(400, 1500);

      // Capture-phase so we see the pointer before the content that paints over Addy.
      document.addEventListener('pointerdown', this.onDown, true);
      document.addEventListener('touchstart', this.onTouch, { passive: false });
      window.addEventListener('resize', this.onResize);
      document.addEventListener('visibilitychange', this.onVisibility);
      this.wake();
    }
    disconnectedCallback() {
      this.stop();
      document.removeEventListener('pointerdown', this.onDown, true);
      document.removeEventListener('touchstart', this.onTouch);
      window.removeEventListener('resize', this.onResize);
      document.removeEventListener('visibilitychange', this.onVisibility);
    }

    // ---------- art ----------
    imgFor(url) {
      let im = this.imgs.get(url);
      if (im) return im;
      im = document.createElement('img');
      im.alt = ''; im.draggable = false; im.src = url;
      im.addEventListener('load', () => { if (im.classList.contains('on')) this.fitHeight(); });
      this.body.appendChild(im);
      this.imgs.set(url, im);
      return im;
    }
    fitHeight() {
      const im = this.cur && this.imgs.get(this.cur.frames[this.frame]);
      if (!im || !im.naturalWidth) return;
      this.h = Math.round(this.size * im.naturalHeight / im.naturalWidth);
      this.el.style.height = this.h + 'px';
      this.keepInside(); this.place();
    }
    animFor(state) {
      const key = { walking: 'walk', landing: 'carried' }[state] || state;
      const list = this.anims[key] || this.anims.idle;
      return list[Math.floor(Math.random() * list.length)];
    }
    useAnim(a) {
      if (a === this.cur) return;
      this.cur = a; this.frame = 0; this.frameAcc = 0;
      this.showFrame(); this.fitHeight();
    }
    showFrame() {
      const on = this.cur.frames[this.frame];
      this.imgs.forEach((im, url) => im.classList.toggle('on', url === on));
    }

    // ---------- movement ----------
    vw() { return document.documentElement.clientWidth; }
    vh() { return document.documentElement.clientHeight; }
    place() { this.el.style.transform = `translate(${this.x}px,${this.y}px)`; }
    keepInside() {
      this.x = clamp(this.x, 8, this.vw() - this.size - 8);
      this.y = clamp(this.y, 8, this.vh() - this.h - 8);
    }
    setState(s) {
      if (this.state === s) return;
      this.el.classList.remove('idle', 'walking', 'carried', 'landing');
      this.state = s;
      this.el.classList.add(s);
      if (s !== 'landing') this.useAnim(this.animFor(s)); // landing keeps the carried pose
    }
    face(dir) { this.facing = dir; this.el.classList.toggle('flip', dir < 0); }
    pickTarget() {
      // anywhere in the viewport, but far enough that she actually travels
      let t, tries = 0;
      do {
        t = { x: rand(8, this.vw() - this.size - 8), y: rand(8, this.vh() - this.h - 8) };
        tries++;
      } while (Math.hypot(t.x - this.x, t.y - this.y) < Math.min(this.vw(), this.vh()) * .25 && tries < 8);
      this.target = t;
      this.face(t.x >= this.x ? 1 : -1);
      this.setState('walking');
    }

    // ---------- grab & drag ----------
    // She paints behind the page, so the pointer lands on whatever is on top of
    // her. We take it only if that spot is see-through: nothing interactive and
    // nothing with a background between the target and her parent element.
    hitsAddy(e) {
      if (e.clientX < this.x - 14 || e.clientX > this.x + this.size + 14) return false;
      if (e.clientY < this.y - 14 || e.clientY > this.y + this.h + 14) return false;
      const stop = this.parentElement || document.body;
      for (const n of e.composedPath()) {
        if (n === this.el) return true;
        if (n === stop || n === document.body || !(n instanceof Element)) break;
        if (n.matches(INTERACTIVE)) return false;
        const cs = getComputedStyle(n);
        if (cs.backgroundImage !== 'none') return false;
        const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/);
        if (m) { const p = m[1].split(/[\s,\/]+/); if (p.length < 4 || +p[3] > 0) return false; }
      }
      return true;
    }
    pointerDown(e) {
      if (e.button !== 0 || this.grab || !this.hitsAddy(e)) return;
      e.preventDefault(); e.stopPropagation();
      try { this.el.setPointerCapture(e.pointerId); } catch (_) { /* no live pointer (synthetic event) */ }
      this.grab = { id: e.pointerId, dx: e.clientX - this.x, dy: e.clientY - this.y, moved: false, lastX: e.clientX };
      this.el.addEventListener('pointermove', this.onMove);
      this.el.addEventListener('pointerup', this.onUp);
      this.el.addEventListener('pointercancel', this.onUp);
      this.setState('carried');
    }
    pointerMove(e) {
      if (!this.grab || e.pointerId !== this.grab.id) return;
      const nx = e.clientX - this.grab.dx, ny = e.clientY - this.grab.dy;
      if (Math.abs(e.clientX - this.grab.lastX) > 2) this.face(e.clientX > this.grab.lastX ? 1 : -1);
      this.grab.moved = this.grab.moved || Math.hypot(nx - this.x, ny - this.y) > 4;
      this.grab.lastX = e.clientX;
      this.x = nx; this.y = ny; this.keepInside(); this.place();
    }
    release() {
      if (!this.grab) return;
      const tapped = !this.grab.moved;
      this.grab = null;
      this.el.removeEventListener('pointermove', this.onMove);
      this.el.removeEventListener('pointerup', this.onUp);
      this.el.removeEventListener('pointercancel', this.onUp);
      this.setState('landing');
      this.idleUntil = performance.now() + (tapped ? 500 : rand(800, 2000));
      setTimeout(() => { if (this.state === 'landing') this.setState('idle'); }, 330);
      this.wake();
    }

    // ---------- loop ----------
    wake() { if (!this.raf && this.isConnected && !document.hidden) { this.last = 0; this.raf = requestAnimationFrame(t => this.tick(t)); } }
    stop() { cancelAnimationFrame(this.raf); this.raf = 0; }
    tick(now) {
      this.raf = 0;
      if (document.hidden) return;
      const dt = this.last ? Math.min(.05, (now - this.last) / 1000) : 0; this.last = now;

      if (this.cur.frames.length > 1) {
        this.frameAcc += dt;
        if (this.frameAcc >= 1 / this.cur.fps) { this.frameAcc = 0; this.frame = (this.frame + 1) % this.cur.frames.length; this.showFrame(); }
      }
      if (!this.paused && !this.grab && this.state !== 'landing') {
        if (this.state === 'walking' && this.target) {
          const dx = this.target.x - this.x, dy = this.target.y - this.y, dist = Math.hypot(dx, dy), step = this.speed * dt;
          if (dist <= step) {
            this.x = this.target.x; this.y = this.target.y; this.target = null;
            this.setState('idle');
            if (Math.random() < .5) this.face(-this.facing); // turn around now and then while resting
            this.idleUntil = now + rand(1200, 4500);
          } else { this.x += dx / dist * step; this.y += dy / dist * step; }
          this.place();
        } else if (this.state === 'idle' && now >= this.idleUntil) this.pickTarget();
      }
      this.raf = requestAnimationFrame(t => this.tick(t));
    }
  }
  customElements.define('addy-pet', AddyPet);
})();

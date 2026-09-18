/**
 * pet.js — a wandering, grabbable screen companion.
 *
 * Drop-in for any page:
 *   <script src="pet.js"></script>
 *   <script>const addy = Pet.create({ image: "assets/addy.png" });</script>
 *
 * It walks to random points across the whole viewport, pauses, turns around,
 * and keeps going. Pointer down grabs it; it hangs from the cursor; release
 * drops it where it is and it resumes wandering after a moment.
 *
 * Sprites (swap when the real art lands). Every state is optional and falls
 * back to `image`:
 *   Pet.create({
 *     image: "addy.png",                         // static fallback, flipped for direction
 *     sprites: {
 *       walk:    { src: "walk.png",  frames: 6, fps: 10, width: 128, height: 128 },
 *       idle:    { src: "idle.png",  frames: 4, fps: 4,  width: 128, height: 128 },
 *       carried: { src: "hang.png",  frames: 2, fps: 3,  width: 128, height: 128 },
 *     },
 *     facing: "right",   // which way the source art faces; the other way is a CSS flip
 *     size: 110,         // rendered width in px
 *     speed: 70,         // px per second
 *     crop: 0.66,        // show only the top fraction of a static image (Addy has a wordmark under her)
 *     layer: "behind",   // "behind" = under the page content (default), "front" = above everything
 *   })
 *
 * For "behind" to work, the page content must sit above z-index 0, e.g.
 * `main { position: relative; z-index: 1 }`. The pet is still grabbable
 * wherever it shows through (margins, gaps, transparent areas) — but note a
 * transparent wrapper still swallows clicks, so give wrappers
 * `pointer-events: none` and their real children `pointer-events: auto`.
 *
 * A sprite sheet is a horizontal strip: `frames` cells of `width` x `height`.
 *
 * API: pet.pause(), pet.resume(), pet.goTo(x, y), pet.setSpeed(pxPerSec), pet.setLayer("behind"|"front"),
 *      pet.setImage(src, { crop, facing }), pet.setSprites(sprites, { facing }),
 *      pet.destroy(), pet.el, pet.state
 * Options also take `respectReducedMotion: true` to stay put when the OS asks
 * for reduced motion (default is to wander regardless; still draggable either way).
 */
(function (global) {
  "use strict";

  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const CSS = `
  .pet {
    position: fixed; left: 0; top: 0; z-index: 2147483000;
  }
  .pet.behind { z-index: 0; }
  .pet {
    touch-action: none; user-select: none; -webkit-user-drag: none;
    cursor: grab; will-change: transform;
    filter: drop-shadow(0 8px 6px rgba(0,0,0,0.18));
  }
  /* forgiving hitbox: a little slack around the sprite so a moving target is easy to catch */
  .pet::before { content: ""; position: absolute; inset: -14px; }
  .pet.carried { cursor: grabbing; }
  .pet .pet-body {
    width: 100%; height: 100%;
    transform-origin: 50% 100%;
    background-repeat: no-repeat; background-size: auto 100%;
    overflow: hidden;
  }
  .pet .pet-body img { display: block; width: 100%; height: auto; pointer-events: none; }
  .pet.flip .pet-body { transform: scaleX(-1); }
  .pet.walking .pet-body { animation: pet-waddle 420ms ease-in-out infinite; }
  .pet.walking.flip .pet-body { animation: pet-waddle-flip 420ms ease-in-out infinite; }
  .pet.idle .pet-body { animation: pet-breathe 3s ease-in-out infinite; }
  .pet.carried .pet-body { transform-origin: 50% 0%; animation: pet-dangle 1.4s ease-in-out infinite; }
  .pet.carried.flip .pet-body { animation: pet-dangle-flip 1.4s ease-in-out infinite; }
  .pet.landing .pet-body { animation: pet-land 320ms ease-out 1; }
  .pet.landing.flip .pet-body { animation: pet-land-flip 320ms ease-out 1; }
  .pet.sheet .pet-body img { display: none; }
  @keyframes pet-waddle {
    0%,100% { transform: translateY(0) rotate(-3deg); }
    50%      { transform: translateY(-9%) rotate(3deg); }
  }
  @keyframes pet-waddle-flip {
    0%,100% { transform: scaleX(-1) translateY(0) rotate(-3deg); }
    50%      { transform: scaleX(-1) translateY(-9%) rotate(3deg); }
  }
  @keyframes pet-breathe {
    0%,100% { transform: scale(1,1); }
    50%      { transform: scale(1.02,0.98); }
  }
  @keyframes pet-dangle {
    0%,100% { transform: rotate(-7deg); }
    50%      { transform: rotate(7deg); }
  }
  @keyframes pet-dangle-flip {
    0%,100% { transform: scaleX(-1) rotate(-7deg); }
    50%      { transform: scaleX(-1) rotate(7deg); }
  }
  @keyframes pet-land {
    0%   { transform: scale(1.15,0.8); }
    50%  { transform: scale(0.95,1.06); }
    100% { transform: scale(1,1); }
  }
  @keyframes pet-land-flip {
    0%   { transform: scaleX(-1.15) scaleY(0.8); }
    50%  { transform: scaleX(-0.95) scaleY(1.06); }
    100% { transform: scaleX(-1) scaleY(1); }
  }
  .pet.still .pet-body { animation: none !important; }
  .pet.still.flip .pet-body { transform: scaleX(-1) !important; }`;

  let styleInjected = false;

  function create(opts = {}) {
    if (!styleInjected) {
      const st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
      styleInjected = true;
    }

    const o = {
      image: opts.image,
      sprites: opts.sprites || {},
      facing: opts.facing || "right",
      size: opts.size || 110,
      speed: opts.speed || 70,
      crop: opts.crop ?? 1,
      idleMin: opts.idleMin ?? 1.2,
      idleMax: opts.idleMax ?? 4.5,
      margin: opts.margin ?? 8,
      start: opts.start,
      layer: opts.layer || "behind",
      // wanders regardless of OS motion settings by default; pass true to stay put under reduced motion
      respectReducedMotion: opts.respectReducedMotion ?? false,
    };
    const reduced = prefersReduced && o.respectReducedMotion;

    // ---------- DOM ----------
    const el = document.createElement("div");
    el.className = "pet idle" + (reduced ? " still" : "") + (o.layer === "behind" ? " behind" : "");
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", opts.label || "Addy, wandering around the page. Drag to move.");
    const body = document.createElement("div");
    body.className = "pet-body";
    const img = document.createElement("img");
    img.alt = "";
    img.draggable = false;
    if (o.image) img.src = o.image;
    body.appendChild(img);
    el.appendChild(body);
    el.style.width = o.size + "px";
    document.body.appendChild(el);

    // static image: size the box to the cropped image height once it loads
    let h = o.size;
    img.addEventListener("load", () => {
      const ratio = (img.naturalHeight / img.naturalWidth) * o.crop;
      h = Math.round(o.size * ratio);
      el.style.height = h + "px";
      keepInside();
      place();
    });

    // ---------- sprite sheets ----------
    let sheet = null, frame = 0, frameAcc = 0;
    function setSheet(name) {
      const s = o.sprites[name];
      if (!s) { sheet = null; el.classList.remove("sheet"); body.style.backgroundImage = ""; return; }
      if (sheet === s) return;
      sheet = s; frame = 0; frameAcc = 0;
      el.classList.add("sheet");
      body.style.backgroundImage = `url("${s.src}")`;
      h = Math.round(o.size * (s.height / s.width));
      el.style.height = h + "px";
      body.style.backgroundSize = `${s.frames * 100}% 100%`;
      drawFrame();
    }
    function drawFrame() {
      if (!sheet) return;
      body.style.backgroundPosition = `${(frame / (sheet.frames - 1 || 1)) * 100}% 0`;
    }

    // ---------- state ----------
    const pet = {
      el, x: 0, y: 0, dir: 1,
      state: "idle",          // idle | walking | carried | landing
      target: null, idleUntil: 0, paused: false,
      pause() { pet.paused = true; setState("idle"); },
      resume() { pet.paused = false; },
      goTo(x, y) { pet.target = { x, y }; face(x >= pet.x ? 1 : -1); setState("walking"); },
      setSpeed(v) { o.speed = v; },
      setLayer(layer) { o.layer = layer; el.classList.toggle("behind", layer === "behind"); },
      // swap the static image (e.g. a new PNG from the art team)
      setImage(src, { crop = 1, facing } = {}) {
        o.crop = crop; if (facing) o.facing = facing;
        o.sprites = {}; setSheet(null); img.src = src; face(pet.dir);
      },
      // swap in animated sprite sheets (see header for the shape)
      setSprites(sprites, { facing } = {}) {
        o.sprites = sprites || {}; if (facing) o.facing = facing;
        sheet = null; setSheet(pet.state === "landing" ? "idle" : pet.state); face(pet.dir);
      },
      destroy() { cancelAnimationFrame(raf); el.remove(); removeEventListener("resize", onResize); },
    };

    const vw = () => document.documentElement.clientWidth;
    const vh = () => document.documentElement.clientHeight;

    function place() { el.style.transform = `translate(${pet.x}px, ${pet.y}px)`; }
    function keepInside() {
      pet.x = clamp(pet.x, o.margin, vw() - o.size - o.margin);
      pet.y = clamp(pet.y, o.margin, vh() - h - o.margin);
    }
    const onResize = () => { keepInside(); place(); };
    addEventListener("resize", onResize);

    function setState(s) {
      if (pet.state === s) return;
      el.classList.remove("idle", "walking", "carried", "landing");
      pet.state = s;
      el.classList.add(s);
      setSheet(s === "landing" ? "idle" : s);
    }
    function face(dir) {
      pet.dir = dir;
      const flip = (o.facing === "right") ? dir < 0 : dir > 0;
      el.classList.toggle("flip", flip);
    }
    function pickTarget() {
      // wander anywhere in the viewport, but favour a decent distance so it actually travels
      let t, tries = 0;
      do {
        t = { x: rand(o.margin, vw() - o.size - o.margin), y: rand(o.margin, vh() - h - o.margin) };
        tries++;
      } while (Math.hypot(t.x - pet.x, t.y - pet.y) < Math.min(vw(), vh()) * 0.25 && tries < 8);
      pet.target = t;
      face(t.x >= pet.x ? 1 : -1);
      setState("walking");
    }

    // start position
    pet.x = o.start?.x ?? rand(o.margin, vw() - o.size - o.margin);
    pet.y = o.start?.y ?? vh() - o.size - o.margin - 20;
    place();
    pet.idleUntil = performance.now() + rand(400, 1500);

    // ---------- grab & drag ----------
    let grab = null; // { dx, dy, moved, lastX, lastY, vx, vy }
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      grab = { dx: e.clientX - pet.x, dy: e.clientY - pet.y, moved: false, lastX: e.clientX, lastY: e.clientY, vx: 0 };
      setState("carried");
    });
    el.addEventListener("pointermove", (e) => {
      if (!grab) return;
      const nx = e.clientX - grab.dx, ny = e.clientY - grab.dy;
      if (Math.abs(e.clientX - grab.lastX) > 2) face(e.clientX > grab.lastX ? 1 : -1);
      grab.moved = grab.moved || Math.hypot(nx - pet.x, ny - pet.y) > 4;
      grab.lastX = e.clientX; grab.lastY = e.clientY;
      pet.x = nx; pet.y = ny; keepInside(); place();
    });
    const release = (e) => {
      if (!grab) return;
      const tapped = !grab.moved;
      grab = null;
      setState("landing");
      // a tap without dragging = a little hop, then carry on
      pet.idleUntil = performance.now() + (tapped ? 500 : rand(800, 2000));
      setTimeout(() => { if (pet.state === "landing") setState("idle"); }, 330);
    };
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);

    // ---------- loop ----------
    let last = performance.now(), raf = 0;
    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;

      if (sheet && sheet.frames > 1) {
        frameAcc += dt;
        if (frameAcc >= 1 / (sheet.fps || 8)) { frameAcc = 0; frame = (frame + 1) % sheet.frames; drawFrame(); }
      }

      if (!pet.paused && !grab && pet.state !== "landing") {
        if (pet.state === "walking" && pet.target) {
          const dx = pet.target.x - pet.x, dy = pet.target.y - pet.y;
          const dist = Math.hypot(dx, dy);
          const step = o.speed * dt;
          if (dist <= step) {
            pet.x = pet.target.x; pet.y = pet.target.y; pet.target = null;
            setState("idle");
            pet.idleUntil = now + rand(o.idleMin, o.idleMax) * 1000;
          } else {
            pet.x += (dx / dist) * step; pet.y += (dy / dist) * step;
          }
          place();
        } else if (pet.state === "idle" && now >= pet.idleUntil && !reduced) {
          pickTarget();
        }
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return pet;
  }

  global.Pet = { create };
})(window);

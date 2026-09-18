/**
 * pet.js — a wandering, grabbable screen companion.
 *
 * Drop-in for any page:
 *   <script src="pet.js"></script>
 *   <script>
 *     const addy = Pet.create({
 *       sprites: {
 *         walk:    { frames: ["assets/addywalk1.png", ..., "assets/addywalk6.png"], fps: 8 },
 *         idle:    [{ frames: ["assets/addypointing.png"] }, { frames: ["assets/addythinking.png"] }],
 *         carried: [{ frames: ["assets/addycelebrating.png"] }, { frames: ["assets/addythinking.png"] }],
 *       },
 *       facing: "right",   // which way the art faces; the other way is a CSS flip
 *       size: 120,         // rendered width in px
 *       speed: 70,         // px per second
 *       layer: "behind",   // "behind" = under the page content (default), "front" = above everything
 *     });
 *   </script>
 *
 * It walks to random points across the whole viewport, pauses, turns around,
 * and keeps going. Pointer down grabs it; it hangs from the cursor; release
 * drops it where it is and it resumes wandering after a moment.
 *
 * Sprite states: walk | idle | carried. Each is one of
 *   { frames: [url, ...], fps }                       — a list of same-sized images
 *   { src, frames: N, width, height, fps }            — a horizontal strip of N cells
 *   [ <either of the above>, ... ]                    — variants; one is picked at random
 *                                                       each time the pet enters that state
 * Missing states fall back to idle, then to `image` (a single static PNG;
 * `crop` shows only the top fraction of it). The pose shown while carried
 * stays on through the landing squash.
 *
 * For "behind" to work, the page content must sit above z-index 0, e.g.
 * `main { position: relative; z-index: 1 }`. The pet is still grabbable
 * wherever it shows through (margins, gaps, transparent areas) — but note a
 * transparent wrapper still swallows clicks, so give wrappers
 * `pointer-events: none` and their real children `pointer-events: auto`.
 *
 * API: pet.pause(), pet.resume(), pet.goTo(x, y), pet.setSpeed(pxPerSec),
 *      pet.setLayer("behind"|"front"), pet.setImage(src, { crop, facing }),
 *      pet.setSprites(sprites, { facing }), pet.destroy(), pet.el, pet.state
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
    touch-action: none; user-select: none; -webkit-user-drag: none;
    cursor: grab; will-change: transform;
    filter: drop-shadow(0 8px 6px rgba(0,0,0,0.18));
  }
  .pet.behind { z-index: 0; }
  /* forgiving hitbox: a little slack around the sprite so a moving target is easy to catch */
  .pet::before { content: ""; position: absolute; inset: -14px; }
  .pet.carried { cursor: grabbing; }
  .pet .pet-body {
    position: relative; width: 100%; height: 100%;
    transform-origin: 50% 100%;
    background-repeat: no-repeat; overflow: hidden;
  }
  .pet .pet-body img {
    position: absolute; inset: 0; width: 100%; height: auto;
    pointer-events: none; display: none;
  }
  .pet .pet-body img.on { display: block; }
  .pet.flip .pet-body { transform: scaleX(-1); }
  /* frame-animated walk: the art does the legs, we just add a soft bob */
  .pet.walking .pet-body { animation: pet-bob 500ms ease-in-out infinite; }
  .pet.walking.flip .pet-body { animation: pet-bob-flip 500ms ease-in-out infinite; }
  /* static single image walk: exaggerate with a waddle instead */
  .pet.walking.static .pet-body { animation: pet-waddle 420ms ease-in-out infinite; }
  .pet.walking.static.flip .pet-body { animation: pet-waddle-flip 420ms ease-in-out infinite; }
  .pet.idle .pet-body { animation: pet-breathe 3s ease-in-out infinite; }
  .pet.idle.flip .pet-body { animation: pet-breathe-flip 3s ease-in-out infinite; }
  .pet.carried .pet-body { transform-origin: 50% 0%; animation: pet-dangle 1.4s ease-in-out infinite; }
  .pet.carried.flip .pet-body { animation: pet-dangle-flip 1.4s ease-in-out infinite; }
  .pet.landing .pet-body { animation: pet-land 320ms ease-out 1; }
  .pet.landing.flip .pet-body { animation: pet-land-flip 320ms ease-out 1; }
  @keyframes pet-bob {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-4%); }
  }
  @keyframes pet-bob-flip {
    0%,100% { transform: scaleX(-1) translateY(0); }
    50%      { transform: scaleX(-1) translateY(-4%); }
  }
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
  @keyframes pet-breathe-flip {
    0%,100% { transform: scale(-1,1); }
    50%      { transform: scale(-1.02,0.98); }
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
    el.appendChild(body);
    el.style.width = o.size + "px";
    el.style.height = o.size + "px";
    document.body.appendChild(el);

    let h = o.size;
    function setHeight(px) { h = Math.round(px); el.style.height = h + "px"; keepInside(); place(); }

    // ---------- sprites ----------
    // Every image used by any state is created once and kept in the DOM, so
    // switching frames is a class toggle, not a network/decode hit.
    const imgs = new Map();  // url -> <img>
    function imgFor(url) {
      let im = imgs.get(url);
      if (im) return im;
      im = document.createElement("img");
      im.alt = ""; im.draggable = false; im.src = url;
      im.addEventListener("load", () => {
        // size the box from the frame currently showing (all frames of a state share a size)
        if (cur && cur.list && cur.list[frame] === im) {
          setHeight(o.size * (im.naturalHeight / im.naturalWidth) * (cur === fallback ? o.crop : 1));
        }
      });
      body.appendChild(im);
      imgs.set(url, im);
      return im;
    }
    function normalize(sprites) {
      // resolve each state to a list of variants, each { list: [<img>], fps } or { strip: <sheet>, fps }
      const one = (s) => {
        if (!s) return null;
        if (Array.isArray(s.frames)) return { list: s.frames.map(imgFor), fps: s.fps || 8 };
        if (s.src) return { strip: s, fps: s.fps || 8 };
        return null;
      };
      const out = {};
      for (const [name, s] of Object.entries(sprites)) {
        const variants = (Array.isArray(s) ? s : [s]).map(one).filter(Boolean);
        if (variants.length) out[name] = variants;
      }
      return out;
    }
    let anims = normalize(o.sprites);
    let fallback = o.image ? { list: [imgFor(o.image)], fps: 1 } : null;
    let cur = null, frame = 0, frameAcc = 0;

    function animFor(state) {
      const key = { walking: "walk", landing: "carried" }[state] || state;
      const variants = anims[key] || anims.idle || anims.walk;
      if (!variants) return fallback;
      return variants[Math.floor(Math.random() * variants.length)];
    }
    function showFrame() {
      if (!cur) return;
      if (cur.list) {
        cur.list.forEach((im, i) => im.classList.toggle("on", i === frame));
      } else {
        const s = cur.strip;
        body.style.backgroundPosition = `${(frame / (s.frames - 1 || 1)) * 100}% 0`;
      }
    }
    function useAnim(a) {
      if (a === cur) return;
      cur = a; frame = 0; frameAcc = 0;
      body.style.backgroundImage = ""; body.style.backgroundSize = "";
      imgs.forEach((im) => im.classList.remove("on"));
      if (!a) return;
      if (a.strip) {
        const s = a.strip;
        body.style.backgroundImage = `url("${s.src}")`;
        body.style.backgroundSize = `${s.frames * 100}% 100%`;
        setHeight(o.size * (s.height / s.width));
      } else {
        const im = a.list[0];
        if (im.naturalWidth) setHeight(o.size * (im.naturalHeight / im.naturalWidth) * (a === fallback ? o.crop : 1));
      }
      // a single static image gets the cartoon waddle; real frames only get a bob
      el.classList.toggle("static", !!(a.list && a.list.length === 1));
      showFrame();
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
      // swap to a single static image (e.g. a quick PNG from the art team)
      setImage(src, { crop = 1, facing } = {}) {
        o.crop = crop; if (facing) o.facing = facing;
        anims = {}; fallback = { list: [imgFor(src)], fps: 1 };
        cur = null; useAnim(animFor(pet.state)); face(pet.dir);
      },
      // swap in animated states (see header for the shape)
      setSprites(sprites, { facing } = {}) {
        if (facing) o.facing = facing;
        anims = normalize(sprites || {});
        cur = null; useAnim(animFor(pet.state)); face(pet.dir);
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
      if (s !== "landing") useAnim(animFor(s)); // landing keeps the carried pose
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

    useAnim(animFor("idle"));

    // start position
    pet.x = o.start?.x ?? rand(o.margin, vw() - o.size - o.margin);
    pet.y = o.start?.y ?? vh() - o.size - o.margin - 20;
    place();
    pet.idleUntil = performance.now() + rand(400, 1500);

    // ---------- grab & drag ----------
    let grab = null; // { dx, dy, moved, lastX }
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      try { el.setPointerCapture(e.pointerId); } catch (_) { /* synthetic events have no pointer to capture */ }
      grab = { dx: e.clientX - pet.x, dy: e.clientY - pet.y, moved: false, lastX: e.clientX };
      setState("carried");
    });
    el.addEventListener("pointermove", (e) => {
      if (!grab) return;
      const nx = e.clientX - grab.dx, ny = e.clientY - grab.dy;
      if (Math.abs(e.clientX - grab.lastX) > 2) face(e.clientX > grab.lastX ? 1 : -1);
      grab.moved = grab.moved || Math.hypot(nx - pet.x, ny - pet.y) > 4;
      grab.lastX = e.clientX;
      pet.x = nx; pet.y = ny; keepInside(); place();
    });
    const release = () => {
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

      // advance frame animation (only while it has more than one frame)
      const n = cur ? (cur.list ? cur.list.length : cur.strip.frames) : 0;
      if (n > 1 && !reduced) {
        frameAcc += dt;
        if (frameAcc >= 1 / cur.fps) { frameAcc = 0; frame = (frame + 1) % n; showFrame(); }
      }

      if (!pet.paused && !grab && pet.state !== "landing") {
        if (pet.state === "walking" && pet.target) {
          const dx = pet.target.x - pet.x, dy = pet.target.y - pet.y;
          const dist = Math.hypot(dx, dy);
          const step = o.speed * dt;
          if (dist <= step) {
            pet.x = pet.target.x; pet.y = pet.target.y; pet.target = null;
            setState("idle");
            if (Math.random() < 0.5) face(-pet.dir); // turn around now and then while resting
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

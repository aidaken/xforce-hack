import { useEffect, useState } from "react";
import { loadScript } from "../lib/loadScript.js";

const HOOPS = "addy-study-hoops";
const HOUSE = "addy-alpaca-house";
const DISMISS_KEY = "addy-study-ball-dismissed";

function attachReward(house) {
  if (house && typeof house.generateReward !== "function") {
    house.generateReward = async (reading) => ({
      title: String(reading.title || "Reading keepsake").slice(0, 100),
      description: "You finished this reading. Hang it in your room.",
      imageUrl: `${window.location.origin}/study-activities/components/assets/mona-alpaca.png`,
    });
  }
  return house;
}

function parkAtFloor(el) {
  if (!el?.measure) return;
  el.measure();
  const r = el.radius || 30;
  el.state = {
    x: Math.max(r + 24, Math.min(el.width - r - 96, el.width * 0.62)),
    y: el.height - r,
    vx: 0,
    vy: 0,
    angle: el.state?.angle || 0,
    sleep: true,
  };
  el.squash = 0;
  el.paint?.();
}

/** Fidget on the floor until a passage is finished; then the hoop unlocks. */
function setupHoops(el, onDismiss) {
  const Ball = customElements.get("study-ball");
  const Hoops = customElements.get("study-hoops");
  if (!el?.shadowRoot || !Ball || !Hoops || el._addySetup) return el;
  el._addySetup = true;

  const earn = el.shadowRoot.querySelector(".earn");
  if (earn) earn.hidden = true;
  const hint = el.shadowRoot.querySelector(".hint");
  if (hint) hint.hidden = true;

  el.wake = function () {
    return Ball.prototype.wake.call(this);
  };
  el.advancePhysics = function (s, dt, w, h, r) {
    if (this.inFlight) return Hoops.advanceShot(s, dt, w, h, r);
    return Ball.advance(s, dt, w, h, r);
  };
  el.grab = function (e) {
    if (this.inFlight) {
      this.message?.("Let this shot finish, or reset the ball.");
      return;
    }
    if (this.throws > 0) return Hoops.prototype.grab.call(this, e);
    return Ball.prototype.grab.call(this, e);
  };
  el.release = function (e) {
    if (this.throws > 0) return Hoops.prototype.release.call(this, e);
    return Ball.prototype.release.call(this, e);
  };
  el.reset = function () {
    if (this.inFlight) {
      Hoops.prototype.reset.call(this);
      return;
    }
    if (this.throws > 0) Hoops.prototype.reset.call(this);
    else Ball.prototype.reset.call(this);
    parkAtFloor(this);
  };
  const refresh = el.refreshRewards.bind(el);
  el.refreshRewards = function () {
    refresh();
    if (!this.ball) return;
    this.ball.removeAttribute("aria-disabled");
    const dock = this.shadowRoot.querySelector(".dock");
    const shooting = this.throws > 0 || this.inFlight;
    if (dock) dock.hidden = !shooting;
    if (this.q(".hoop")) this.q(".hoop").hidden = this.hiddenBall || !shooting;
    this.ball.setAttribute(
      "aria-label",
      shooting
        ? "Basketball. Drag toward the hoop to shoot. Click twice to put the ball away."
        : "Basketball. Drag to bounce it. Click twice to put it away. Finish the reading to unlock the hoop.",
    );
  };

  let down = null;
  let lastTap = 0;
  el.ball.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    down = { x: e.clientX, y: e.clientY, t: performance.now() };
  });
  el.ball.addEventListener("pointerup", (e) => {
    if (!down || e.button !== 0) return;
    const tap =
      Math.hypot(e.clientX - down.x, e.clientY - down.y) < 12 &&
      performance.now() - down.t < 400;
    down = null;
    if (!tap) {
      lastTap = 0;
      return;
    }
    const now = performance.now();
    if (now - lastTap < 450) {
      lastTap = 0;
      e.preventDefault();
      e.stopPropagation();
      onDismiss();
      return;
    }
    lastTap = now;
  });
  el.ball.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDismiss();
  });

  parkAtFloor(el);
  el.refreshRewards();
  return el;
}

/**
 * Charlotte's play widgets. Mounted only on the Guided tab.
 * The ball lives on the floor as a fidget; the hoop unlocks after a
 * finished reading. Click the ball twice to put it away.
 */
export default function StudyPlay({ active }) {
  const [ballGone, setBallGone] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [ballReady, setBallReady] = useState(false);

  useEffect(() => {
    if (!active) {
      setBallReady(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      await loadScript("/study-activities/components/study-ball.js");
      await loadScript("/study-activities/components/study-hoops.js");
      await loadScript("/study-activities/components/alpaca-house.js");
      if (cancelled) return;
      await customElements.whenDefined("study-hoops");
      await customElements.whenDefined("alpaca-house");
      const hoops = document.getElementById(HOOPS);
      if (hoops) {
        setupHoops(hoops, () => {
          try {
            sessionStorage.setItem(DISMISS_KEY, "1");
          } catch {
            /* ignore */
          }
          setBallGone(true);
        });
        setBallReady(true);
      }
      attachReward(document.getElementById(HOUSE));
    })();

    const onDone = (e) => {
      const d = e.detail || {};
      const hoops = document.getElementById(HOOPS);
      const earned = Array.isArray(d.outcomes) ? d.outcomes.length : 1;
      hoops?.setSectionsCompleted?.(Math.max(1, earned));
      hoops?.refreshRewards?.();
      const house = attachReward(document.getElementById(HOUSE));
      if (!house?.completeReading) return;
      Promise.resolve(
        house.completeReading({
          id: String(d.id || "reading"),
          title: String(d.title || "Reading"),
          topic: d.topic || d.title,
        }),
      )
        .catch(() => {})
        .finally(() => house.open?.());
    };
    window.addEventListener("reading-completed", onDone);
    return () => {
      cancelled = true;
      window.removeEventListener("reading-completed", onDone);
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      {!ballGone && (
        <study-hoops
          id={HOOPS}
          sections-completed="0"
          style={{ visibility: ballReady ? "visible" : "hidden" }}
        />
      )}
      <alpaca-house id={HOUSE} storage-key="addy-alpaca-house" />
    </>
  );
}

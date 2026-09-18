import { useEffect } from "react";
import { useAddy } from "../state/store.jsx";
import { loadScript } from "../lib/loadScript.js";

const ASSET = "/companion/assets";
const walk = [1, 2, 3, 4, 5, 6].map((i) => `${ASSET}/addywalk${i}.png`);
const pose = (name) => ({ frames: [`${ASSET}/addy${name}.png`] });

/**
 * Thien’s wandering Addy (PR #9). Calm and Playful mount it; Off does not.
 * Do not rewrite pet.js — we only load it.
 */
export default function AddyCompanion() {
  const { state } = useAddy();
  const on = state.buddy === "Calm" || state.buddy === "Playful";

  useEffect(() => {
    if (!on) return undefined;
    let pet;
    let cancelled = false;
    (async () => {
      try {
        await loadScript("/companion/pet.js");
        if (cancelled || !window.Pet) return;
        pet = window.Pet.create({
          sprites: {
            walk: { frames: walk, fps: 8 },
            idle: [pose("pointing"), pose("thinking"), pose("hello")],
            carried: [pose("celebrating"), pose("thinking")],
          },
          facing: "right",
          size: 112,
          speed: state.buddy === "Playful" ? 90 : 55,
          layer: "front",
          respectReducedMotion: true,
          label: "Addy, wandering around the page. Drag to move.",
        });
        if (cancelled) {
          pet.destroy();
          pet = undefined;
          return;
        }
        if (state.rm) pet.pause();
      } catch {
        /* companion is optional */
      }
    })();
    return () => {
      cancelled = true;
      pet?.destroy();
    };
  }, [on, state.buddy, state.rm]);

  return null;
}

import { useEffect, useState } from "react";
import { useAddy } from "../state/store.jsx";
import { loadScript } from "../lib/loadScript.js";

/**
 * Playful buddy = Charlotte's Subway Surfers study-video sidekick.
 * Calm / Off leave it unmounted.
 */
export default function StudyBuddy() {
  const { state } = useAddy();
  const on = state.buddy === "Playful";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!on) {
      setReady(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        await loadScript("/study-activities/components/study-video.js");
        await customElements.whenDefined("study-video");
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setReady(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [on]);

  if (!on || !ready) return null;

  const corner = state.screen === "reading" ? "left" : "right";

  return (
    <study-video
      video-id="7ghSziUQnhs"
      corner={corner}
      style={{ "--study-video-accent": "var(--sage, #285d4c)" }}
    />
  );
}

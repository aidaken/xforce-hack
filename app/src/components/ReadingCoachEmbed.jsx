import { useEffect, useRef } from "react";
import { loadScript } from "../lib/loadScript.js";

/**
 * Thin React mount for Charlotte's <reading-coach> web component.
 * Does not rewrite her code — only assigns `lesson`. Completion events
 * bubble to window for StudyPlay.
 */
export default function ReadingCoachEmbed({ lesson, storageKey }) {
  const ref = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadScript("/study-activities/components/reading-coach.js");
      await customElements.whenDefined("reading-coach");
      if (cancelled || !ref.current || !lesson) return;
      if (storageKey) ref.current.setAttribute("storage-key", storageKey);
      try {
        ref.current.lesson = lesson;
      } catch (err) {
        console.error("reading-coach rejected the lesson", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lesson, storageKey]);

  return (
    <reading-coach
      ref={ref}
      storage-key={storageKey}
      style={{
        display: "block",
        paddingBottom: 168,
        "--coach-font": "inherit",
        "--coach-paper": "var(--surface)",
        "--coach-ink": "var(--text)",
        "--coach-accent": "var(--sage, #285d4c)",
      }}
    />
  );
}

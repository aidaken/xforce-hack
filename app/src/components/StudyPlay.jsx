import { useEffect } from "react";
import { loadScript } from "../lib/loadScript.js";

const HOOPS = "addy-study-hoops";
const HOUSE = "addy-alpaca-house";

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

/**
 * Charlotte's play widgets (basketball + alpaca house). Mounted at app root
 * so they pop up over the reading workspace after a file is ingested.
 */
export default function StudyPlay({ active }) {
  useEffect(() => {
    if (!active) return undefined;
    let cancelled = false;
    (async () => {
      await loadScript("/study-activities/components/study-ball.js");
      await loadScript("/study-activities/components/study-hoops.js");
      await loadScript("/study-activities/components/alpaca-house.js");
      if (cancelled) return;
      await customElements.whenDefined("study-hoops");
      await customElements.whenDefined("alpaca-house");
      attachReward(document.getElementById(HOUSE));
    })();

    const onSection = (e) => {
      const n = Number(e.detail?.completed) || 0;
      document.getElementById(HOOPS)?.setSectionsCompleted?.(n);
    };
    const onDone = (e) => {
      const house = attachReward(document.getElementById(HOUSE));
      if (!house?.completeReading) return;
      const d = e.detail || {};
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
    window.addEventListener("section-completed", onSection);
    window.addEventListener("reading-completed", onDone);
    return () => {
      cancelled = true;
      window.removeEventListener("section-completed", onSection);
      window.removeEventListener("reading-completed", onDone);
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      <study-hoops id={HOOPS} sections-completed="0" />
      <alpaca-house id={HOUSE} storage-key="addy-alpaca-house" />
    </>
  );
}

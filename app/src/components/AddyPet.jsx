import { useEffect } from "react";
import { loadScript } from "../lib/loadScript.js";

/**
 * Addy the alpaca wandering behind the workspace. The element is a vanilla
 * custom element in public/study-activities/components; this only loads it.
 * Render it inside `.addy` so she walks on the app background, under the
 * cards and text. Shown on the dashboard and the reading screen only.
 */
export default function AddyPet({ active = true }) {
  useEffect(() => {
    if (!active) return;
    loadScript("/study-activities/components/addy-pet.js").catch(() => {});
  }, [active]);

  if (!active) return null;
  return <addy-pet />;
}

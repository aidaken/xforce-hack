export const SAMPLES = [
  {
    id: "cellular-respiration",
    title: "OpenStax Biology — Cellular respiration",
    sourceType: "sample",
    text: `Cellular respiration is the process by which cells harvest energy from food molecules. In eukaryotes it usually means oxidizing glucose to carbon dioxide and water while capturing free energy as ATP. The pathway has three tightly linked stages. Glycolysis occurs in the cytosol and splits one glucose into two molecules of pyruvate, with a small net gain of ATP and NADH. If oxygen is available, pyruvate enters mitochondria and is converted to acetyl CoA, which feeds the citric acid cycle. The citric acid cycle oxidizes the remaining carbons to CO2 and loads electron carriers NADH and FADH2. Oxidative phosphorylation then uses those electrons in the electron transport chain; the resulting proton gradient drives ATP synthase. Most of the ATP from glucose is made here. Without oxygen, cells may stop after glycolysis and ferment pyruvate so NAD+ can be regenerated.`,
  },
  {
    id: "useeffect",
    title: "React — useEffect reference",
    sourceType: "sample",
    text: `useEffect lets a component synchronize with an external system. After React paints, it runs your effect. You pass a function, and optionally a dependency array. If you omit the array, the effect runs after every render. If you pass [], it runs once after mount (and its cleanup on unmount). If you pass values, React compares them with Object.is and re-runs the effect when any value changes. Effects should not be used to transform data for rendering; calculate that during render. If an effect fetches, it must ignore stale responses or abort, and it must clean up subscriptions. Strict Mode in development remounts once to surface missing cleanup. Do not treat useEffect as a lifecycle catch-all for "run this when X happens" if X can be handled by events or derived state.`,
  },
  {
    id: "chain-rule",
    title: "OpenStax Calculus — The chain rule",
    sourceType: "sample",
    text: `The chain rule tells you how to differentiate a composition. If y = f(u) and u = g(x), then dy/dx = f'(u) · g'(x), or in Leibniz form dy/dx = dy/du · du/dx. In words: the rate of change of the outer function, evaluated at the inner function, times the rate of change of the inner function. For a longer composition, multiply one derivative per layer, working from the outside in. A common error is differentiating the outer function and forgetting to multiply by the inner derivative. Another is mixing up which function is outer. Example: if y = (3x^2 + 1)^5, the outer is raising to the 5th power and the inner is 3x^2 + 1, so y' = 5(3x^2 + 1)^4 · 6x.`,
  },
];

export function getSample(id) {
  return SAMPLES.find((sample) => sample.id === id) || null;
}

import { toSentences } from "./adapt.js";

/**
 * Turn an ADDY reading (seed or ingested) into Charlotte's <reading-coach>
 * lesson schema. Quotes are exact substrings of the joined source so the
 * coach's source-match check passes. Questions use section titles — no
 * invented facts.
 */
export function readingToCoachLesson(reading) {
  const sents = Array.isArray(reading?.sents) ? reading.sents : [];
  // Join on newline, matching how adapt.js builds step bodies. Joining on a
  // space here would re-weld the blocks and break `source.includes(step.b)`.
  const source = sents.map((s) => s.t).join("\n").trim()
    || String(reading?.source?.text || "").trim();
  if (!source) {
    throw new Error("That reading has no source text for guided mode.");
  }

  const steps = reading.steps?.length
    ? reading.steps
    : [{ t: reading.title || "The passage", b: source, s: sents.map((s) => s.id) }];

  const titles = steps.map((step, i) => String(step.t || `Idea ${i + 1}`).trim() || `Idea ${i + 1}`);

  const sections = steps.map((step, i) => {
    const group = (step.s || [])
      .map((id) => sents.find((s) => s.id === id))
      .filter(Boolean);
    const quote =
      group.find((s) => s.t && source.includes(s.t))?.t ||
      (source.includes(step.b) ? String(step.b).slice(0, Math.min(180, step.b.length)) : source.slice(0, Math.min(140, source.length)));

    const summary = String(step.b || quote).trim();
    const lines = group.map((s) => s.t);
    const stepLines = lines.length ? lines : toSentences(summary).slice(0, 5);
    const authored =
      typeof step.q === "string" &&
      Array.isArray(step.o) &&
      step.o.length >= 2 &&
      step.o.every((x) => typeof x === "string") &&
      Number.isInteger(step.a) &&
      step.o[step.a];
    const options = authored
      ? step.o
      : uniqueThree(titles[i], titles.filter((_, j) => j !== i));

    return {
      id: `sec-${i}-${step.s?.[0] || i}`,
      title: titles[i],
      source,
      quote,
      summary,
      steps: stepLines.length ? stepLines : [summary],
      change: "One idea at a time from your source. Nothing added.",
      recap: titles[i],
      question: {
        prompt: authored ? step.q : "Which idea is this section covering?",
        options,
        correct: authored ? step.a : options.indexOf(titles[i]),
        explanation: summary.slice(0, 280),
      },
    };
  });

  return {
    id: `coach-${reading.id}`,
    version: "1",
    title: reading.title || "Reading",
    topic: reading.folder || reading.title || "Study",
    sections,
  };
}

function uniqueThree(correct, others) {
  const filler = [
    "A detail this passage never states",
    "Something from a different topic",
    "An idea the source does not cover",
  ];
  const rest = [];
  for (const item of others.concat(filler)) {
    const t = String(item || "").trim();
    if (t && t !== correct && !rest.includes(t)) rest.push(t);
    if (rest.length >= 2) break;
  }
  const options = [correct, rest[0], rest[1]].filter(Boolean);
  while (options.length < 3) options.push(`Not in this reading (${options.length})`);
  const seen = new Set();
  return options.map((opt, i) => {
    let x = opt;
    while (seen.has(x)) x = `${opt} · ${i}`;
    seen.add(x);
    return x;
  });
}

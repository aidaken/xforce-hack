/**
 * Fidelity check.
 *
 * Addy restructures somebody's reading, so it owes them an honest account of
 * what survived. This compares the source sentences against the remake steps
 * and reports three things: how many source ideas are covered, how many
 * claims the remake carries that are not traceable to the source, and a plain
 * list of whatever got compressed or dropped.
 *
 * It is deliberately a lexical check, not a model call — it runs instantly,
 * offline, and it cannot flatter itself.
 */

const STOP = new Set(
  ("a an and are as at be been but by can could did do does for from had has " +
    "have how in into is it its may might must not of off on once one only or " +
    "other our out over own same should since so some such than that the their " +
    "them then there these they this those through to too under until up upon " +
    "use used using was were what when where which while who why will with " +
    "would you your").split(" "),
);

function tokens(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

const overlap = (words, bag) => {
  if (!words.length) return 1;
  let hit = 0;
  for (const w of words) if (bag.has(w)) hit += 1;
  return hit / words.length;
};

/** An idea is covered when most of its content words made it into a step. */
const COVERED = 0.65;
/** Below this it is not "compressed", it is gone. */
const COMPRESSED = 0.3;
/** A step gathering this many source sentences is doing real compressing. */
const CROWDED = 5;
/** Never dump more than this many flags on a reader at once. */
const MAX_FLAGS = 6;

const snip = (text, n = 88) => {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > n ? `${clean.slice(0, n - 1).trimEnd()}…` : clean;
};

/**
 * sents: [{ id, t }] from the source. steps: [{ t, b, s }] from the remake.
 * Returns { total, covered, added, flags }.
 */
export function checkFidelity(sents = [], steps = [], { truncated = false } = {}) {
  const units = steps.map((step) => ({
    title: step.t,
    bag: new Set(tokens(`${step.t} ${step.b}`)),
    holds: Array.isArray(step.s) ? step.s.length : 0,
  }));

  const sourceBag = new Set();
  for (const s of sents) for (const w of tokens(s.t)) sourceBag.add(w);

  const dropped = [];
  const squeezed = [];
  let covered = 0;

  for (const sent of sents) {
    const words = tokens(sent.t);
    let best = 0;
    for (const unit of units) best = Math.max(best, overlap(words, unit.bag));
    if (best >= COVERED) covered += 1;
    else if (best >= COMPRESSED) squeezed.push(sent.t);
    else dropped.push(sent.t);
  }

  // Claims in the remake that no source sentence backs up.
  let added = 0;
  for (const step of steps) {
    for (const claim of String(step.b || "").split(/(?<=[.!?])\s+/)) {
      const words = tokens(claim);
      if (words.length < 4) continue;
      if (overlap(words, sourceBag) < 0.5) added += 1;
    }
  }

  const flags = [];
  if (truncated) {
    flags.push(
      "The source was longer than Addy reads in one pass, so the tail of it is not in this version.",
    );
  }
  for (const text of dropped) {
    flags.push(`Not carried over: “${snip(text)}”`);
  }
  for (const text of squeezed) {
    flags.push(`Shortened rather than kept whole: “${snip(text)}”`);
  }
  for (const unit of units) {
    if (unit.holds >= CROWDED) {
      flags.push(
        `“${snip(unit.title, 52)}” gathers ${unit.holds} sentences from the source into one step.`,
      );
    }
  }

  const shown = flags.slice(0, MAX_FLAGS);
  if (flags.length > MAX_FLAGS) {
    shown.push(`…and ${flags.length - MAX_FLAGS} more notes like these.`);
  }

  return { total: sents.length, covered, added, flags: shown };
}

/** The one-line summary the reading screen shows on the fidelity bar. */
export function fidelitySummary(fid) {
  const ideas = `${fid.covered} of ${fid.total} ideas covered`;
  const added =
    fid.added === 1
      ? "1 added that wasn't in the source"
      : `${fid.added} added that weren't in the source`;
  return `${ideas} · ${added}`;
}

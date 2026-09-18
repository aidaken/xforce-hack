import { formatForConcept } from "./api.js";
import { checkFidelity } from "./fidelity.js";

/** A line that opens a list item: bullet glyphs, dashes, or "1." / "1)". */
const LIST_ITEM = /^\s*(?:[●•◦▪·*+–—-]|\d+[.)])\s+/;

/** Looks like a heading: short, no terminal punctuation, not a list item. */
function isHeading(line) {
  return line.length <= 80 && !/[.!?:;]$/.test(line) && !LIST_ITEM.test(line);
}

/**
 * Rejoin PDF hard wraps.
 *
 * A PDF text layer breaks lines at the page margin, so "you added\nsomething
 * new" is one sentence split across two lines. A continuation starts lowercase
 * and follows a line that did not end in punctuation. Headings and list items
 * never continue a previous line, so they always start fresh.
 */
function unwrap(lines) {
  const out = [];
  for (const line of lines) {
    const prev = out[out.length - 1];
    const continues =
      prev && !/[.!?:;]$/.test(prev) && !LIST_ITEM.test(line) && /^[a-z(]/.test(line);
    if (continues) out[out.length - 1] = `${prev} ${line}`;
    else out.push(line);
  }
  return out;
}

/**
 * Split a passage into display units, keeping terminal punctuation.
 *
 * Block structure matters and it lives entirely in the newlines: an ingested
 * PDF or DOCX carries its headings and bullets as separate lines and nothing
 * else. Collapsing whitespace first (the old behaviour) deleted exactly that
 * signal, so headings — which have no terminal punctuation — welded onto the
 * following sentence, and bullets ran together into one wall of text. On the
 * challenge PDF that was 0 units starting with a bullet; now it is 28.
 *
 * So: split on newlines, rejoin hard wraps, then sentence-split only WITHIN a
 * block. A heading or list item stays whole even when it contains a period.
 */
export function toSentences(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);

  const out = [];
  for (const block of unwrap(lines)) {
    if (LIST_ITEM.test(block) || isHeading(block)) {
      out.push(block);
      continue;
    }
    // Let a following sentence open with a bullet or curly quote as well. The
    // old lookahead required [A-Z0-9"'(], so a period before "●" never split
    // and every bullet welded onto the sentence before it.
    out.push(
      ...block
        .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(‘“●•◦▪])/)
        .map((t) => t.trim())
        .filter(Boolean),
    );
  }
  return out;
}

/**
 * The one-line rationale the planner shows above the remake. It names the
 * shape it chose, in Addy's voice. The classifier's own sentence is longer and
 * becomes the "Why?" detail instead.
 */
const PLANNER_LINE = {
  flowchart: "This passage describes a step-by-step process, so I made it a flowchart.",
  checklist:
    "This passage is a set of rules and conditions, so I made it a checklist.",
  quest: "This passage is mostly terms and what they mean, so I made it a quest.",
};

/** Up to this many steps — past that a remake is just the reading again. */
const MAX_STEPS = 6;

function titleFor(firstUnit, index) {
  const first = String(firstUnit || "").trim() || `Part ${index + 1}`;
  // Drop a leading bullet glyph so a list item reads as a title.
  const words = first.replace(LIST_ITEM, "").split(" ").slice(0, 7).join(" ");
  return words.replace(/[.,;:]$/, "");
}

/**
 * Split a passage into sentences and into the beats the remake is built from.
 *
 * Paragraph breaks survive client-side PDF extraction and pasted text, so the
 * author's own paragraphs become the beats. Sentences are cut inside each
 * paragraph rather than across the whole passage — otherwise a heading with
 * no full stop swallows the sentence after it.
 */
function splitPassage(text) {
  const paragraphs = String(text || "")
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  let id = 0;
  const nextId = () => `d${id++}`;
  let groups;

  if (paragraphs.length > 1) {
    groups = paragraphs
      .map((p) => toSentences(p).map((t) => ({ id: nextId(), t })))
      .filter((g) => g.length);
  } else {
    const sents = toSentences(text).map((t) => ({ id: nextId(), t }));
    const per = Math.max(1, Math.ceil(sents.length / 5));
    groups = [];
    for (let i = 0; i < sents.length; i += per) groups.push(sents.slice(i, i + per));
  }

  // Merge the smallest neighbouring pair until the remake is short enough to
  // hold in your head.
  while (groups.length > MAX_STEPS) {
    let at = 0;
    for (let i = 1; i < groups.length - 1; i += 1) {
      const pair = groups[i].length + groups[i + 1].length;
      if (pair < groups[at].length + groups[at + 1].length) at = i;
    }
    groups.splice(at, 2, groups[at].concat(groups[at + 1]));
  }

  return { sents: groups.flat(), groups };
}

/**
 * Turn an /api/ingest document into the shape the reading screens render.
 *
 * The server gives us text, chunks and a detected concept type; it does not
 * generate comprehension questions, so steps built here carry no `q`. The
 * Quest view renders those as read-through beats rather than inventing a
 * question the source never asked.
 */
export function documentToReading(document, folder) {
  const text = String(document.text || "");
  const { sents, groups } = splitPassage(text);

  const steps = groups.map((group, i) => ({
    t: titleFor(group[0]?.t, i),
    // Newline, not space. Joining with a space re-welds the blocks that
    // toSentences just separated, which is what turned an uploaded PDF's
    // headings and bullets back into a wall of text. Rendered with pre-wrap.
    b: group.map((s) => s.t).join("\n"),
    s: group.map((s) => s.id),
  }));

  const rec = formatForConcept(document.conceptType);
  const fidelity = checkFidelity(sents, steps, {
    truncated: /\[truncated\]\s*$/.test(text),
  });

  return {
    id: document.id,
    folder,
    title: document.title,
    mins: Math.max(1, Math.round(text.split(/\s+/).length / 180)),
    status: "Not started",
    rec,
    rationale: PLANNER_LINE[rec] || PLANNER_LINE.flowchart,
    why:
      `${document.plannerRationale || ""} Addy picked this shape from the ` +
      "structure it detected in your source. If it reads wrong, use “This " +
      "isn’t working” and it will rebuild.",
    flags: [],
    fidelity,
    sents,
    steps,
    // kept so a remake can send the passage back to /api/chat
    source: { id: document.id, text, conceptType: document.conceptType },
  };
}

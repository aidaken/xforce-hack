import { formatForConcept } from "./api.js";

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
      prev &&
      !/[.!?:;]$/.test(prev) &&
      !LIST_ITEM.test(line) &&
      /^[a-z(]/.test(line);
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
 * following sentence, and bullets ran together into one wall of text.
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

function titleFor(firstUnit, index) {
  const first = String(firstUnit || "").trim() || `Part ${index + 1}`;
  // Drop a leading bullet glyph so a list item reads as a title.
  const clean = first.replace(LIST_ITEM, "");
  const words = clean.split(" ").slice(0, 7).join(" ");
  return words.replace(/[.,;:]$/, "");
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
  const sentences = toSentences(document.text);
  const sents = sentences.map((t, i) => ({ id: `d${i}`, t }));

  // Group sentences into up to 5 beats so a long passage still reads as steps.
  const perStep = Math.max(1, Math.ceil(sents.length / 5));
  const steps = [];
  for (let i = 0; i < sents.length; i += perStep) {
    const group = sents.slice(i, i + perStep);
    steps.push({
      t: titleFor(group[0]?.t, steps.length),
      // Newline, not space. Joining with a space re-welds the blocks the
      // splitter just separated — which is what turned an uploaded PDF's
      // headings and bullets back into a wall of text. Renderers show this
      // with white-space: pre-wrap.
      b: group.map((s) => s.t).join("\n"),
      s: group.map((s) => s.id),
    });
  }

  return {
    id: document.id,
    folder,
    title: document.title,
    mins: Math.max(1, Math.round(document.text.split(/\s+/).length / 180)),
    status: "Not started",
    rec: formatForConcept(document.conceptType),
    rationale: document.plannerRationale || "",
    why:
      "Addy picked this shape from the structure it detected in your source. " +
      "If it reads wrong, use “This isn’t working” and it will rebuild.",
    flags: [],
    sents,
    steps,
    // kept so a remake can send the passage back to /api/chat
    source: { id: document.id, text: document.text, conceptType: document.conceptType },
  };
}

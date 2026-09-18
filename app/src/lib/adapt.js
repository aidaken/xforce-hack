import { formatForConcept } from "./api.js";

/** Split a passage into display sentences, keeping terminal punctuation. */
export function toSentences(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function titleFor(chunk, index) {
  const first = toSentences(chunk)[0] || `Part ${index + 1}`;
  const words = first.split(" ").slice(0, 7).join(" ");
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
      t: titleFor(group.map((s) => s.t).join(" "), steps.length),
      b: group.map((s) => s.t).join(" "),
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

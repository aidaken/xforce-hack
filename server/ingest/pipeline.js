import { classifyPassage, chunkPassage, titleFromText } from "./classify.js";
import { extractFromPayload } from "./extract.js";
import { getSample } from "./samples.js";
import { saveDocument } from "../store.js";

export async function ingest(payload) {
  let extracted;
  if (payload.type === "sample" || payload.sampleId) {
    const sample = getSample(payload.sampleId || payload.id);
    if (!sample) {
      const err = new Error("Unknown sample passage.");
      err.code = "UNKNOWN_SAMPLE";
      throw err;
    }
    extracted = { ...sample };
  } else {
    extracted = await extractFromPayload(payload);
  }

  const classified = classifyPassage(extracted.text);
  const chunks = chunkPassage(extracted.text);
  const doc = saveDocument({
    sourceType: extracted.sourceType,
    title: extracted.title || titleFromText(extracted.text),
    text: extracted.text,
    conceptType: classified.conceptType,
    plannerRationale: classified.rationale,
    scores: classified.scores,
    chunks,
    sourceUrl: payload.url || null,
  });

  return {
    ok: true,
    document: publicDocument(doc),
  };
}

export function publicDocument(doc) {
  return {
    id: doc.id,
    title: doc.title,
    sourceType: doc.sourceType,
    conceptType: doc.conceptType,
    plannerRationale: doc.plannerRationale,
    charCount: doc.text.length,
    chunkCount: doc.chunks.length,
    excerpt: doc.text.slice(0, 420),
    text: doc.text,
  };
}

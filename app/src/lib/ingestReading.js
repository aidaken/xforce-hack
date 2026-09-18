import { ingest, fileToBase64 } from "./api.js";
import { documentToReading } from "./adapt.js";
import { titleFromFilename } from "./pdfText.js";

/** The server still caps an uploaded file at 8 MB, which only matters on the
 *  scanned-PDF fallback — the normal PDF path sends extracted text, not bytes. */
export const SERVER_UPLOAD_MAX = 8 * 1024 * 1024;

/**
 * Build the /api/ingest body for one panel mode.
 *
 * `pdf` mode posts text, not bytes: the text layer is already pulled out in
 * the browser by lib/pdfText.js. `pdfOcr` is the fallback for a scanned file,
 * where the server's vision OCR is the only way in.
 */
export async function ingestPayload({ mode, file, text, url, pdf }) {
  if (mode === "pdf") {
    return {
      type: "text",
      title: titleFromFilename(file?.name),
      text: String(pdf?.text || "").trim(),
    };
  }

  if (mode === "pdfOcr") {
    return {
      type: "pdf",
      filename: file.name,
      base64: await fileToBase64(file),
    };
  }

  if (mode === "link") {
    return { type: "url", url: String(url || "").trim() };
  }

  const raw = String(text || "").trim();
  // Somebody pasting a bare URL into the text box means "fetch this".
  if (/^https?:\/\//i.test(raw) && !raw.includes("\n") && raw.length < 2000) {
    return { type: "url", url: raw };
  }
  return { type: "text", text: raw };
}

/**
 * `onStage` is called with "extract" → "plan" → "check" so the panel can say
 * what is happening instead of showing a spinner with no story.
 */
export async function ingestAsReading({
  mode,
  file,
  text,
  url,
  pdf,
  folder,
  onStage,
}) {
  onStage?.("extract");
  const payload = await ingestPayload({ mode, file, text, url, pdf });
  const { document } = await ingest(payload);
  onStage?.("plan");
  const reading = documentToReading(document, folder);
  onStage?.("check");
  return reading;
}

/** Jump into the reading workspace with an ingested passage. */
export function openReadingPatch(reading) {
  return {
    screen: "reading",
    reading: reading.id,
    folder: reading.folder,
    tab: "guided",
    quest: 0,
    pick: null,
    questDone: false,
    regen: "",
    hl: [],
    checks: {},
    fidOpen: false,
    // close and reset the add-a-reading panel
    addOpen: false,
    addStage: "",
    addBusy: false,
    addError: "",
    addFile: null,
    addPdf: null,
    addPdfBusy: false,
    addText: "",
    addLink: "",
    dragOver: false,
  };
}

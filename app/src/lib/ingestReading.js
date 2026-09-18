import {
  ingest,
  fileToBase64,
  fileToText,
  ingestTypeForFile,
} from "./api.js";
import { documentToReading } from "./adapt.js";

export async function ingestPayload({ mode, file, text, url }) {
  if (mode === "file" || mode === "pdf") {
    const type = ingestTypeForFile(file.name);
    return type === "gdoc" || type === "text"
      ? { type, filename: file.name, text: await fileToText(file) }
      : { type, filename: file.name, base64: await fileToBase64(file) };
  }
  if (mode === "link") {
    return { type: "url", url: String(url || "").trim() };
  }
  const raw = String(text || "").trim();
  if (/^https?:\/\//i.test(raw) && !raw.includes("\n") && raw.length < 2000) {
    return { type: "url", url: raw };
  }
  return { type: "text", text: raw };
}

export async function ingestAsReading({ mode, file, text, url, folder }) {
  const payload = await ingestPayload({ mode, file, text, url });
  const { document } = await ingest(payload);
  return documentToReading(document, folder);
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
    addBusy: false,
    addDone: "",
    addError: "",
    addFile: null,
    addText: "",
    addLink: "",
    addOpen: false,
    dragOver: false,
  };
}

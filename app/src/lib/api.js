// Thin wrappers over the existing ADDY API (server/router.js). Same origin in
// production and under `npm run dev`; the Vite dev server proxies /api to :3000.

async function call(path, options) {
  const res = await fetch(path, options);
  let body = null;
  try {
    body = await res.json();
  } catch {
    // Non-JSON error page (proxy down, 502 from the platform, …).
  }
  if (!res.ok) {
    const err = new Error(body?.message || `Request to ${path} failed.`);
    err.code = body?.code || `HTTP_${res.status}`;
    err.status = res.status;
    throw err;
  }
  return body;
}

const json = (payload) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

export const getHealth = () => call("/api/health");
export const getSamples = () => call("/api/samples");

/**
 * payload: { type: "text"|"pdf"|"docx"|"gdoc"|"url"|"sample",
 *            text?, url?, sampleId?, filename?, base64? }
 * resolves to { ok, document }
 */
export const ingest = (payload) => call("/api/ingest", json(payload));

/**
 * The server is stateless on Vercel, so the caller keeps `document` in React
 * state and sends it back on every turn rather than trusting documentId.
 */
export const chat = ({
  learner,
  formatPrefs,
  message,
  documentId,
  document,
  history,
}) =>
  call(
    "/api/chat",
    json({ learner, formatPrefs, message, documentId, document, history }),
  );

/**
 * Onboarding stores the format answers as their button labels, which are
 * user-facing copy and will get reworded. The prompt layer takes normalised
 * enums instead, so nothing downstream depends on UI wording.
 *
 * These are a soft bias, not a router: the material picks the structure and
 * these break ties and shape the surface. An empty array means no preference
 * and the planner decides alone — send [], never null.
 */
const FORMAT_PREF_ENUM = {
  "Diagrams and flowcharts": "diagram",
  "Step-by-step checklists": "checklist",
  "Short summaries": "summary",
  "Games and quick quizzes": "quiz",
};

export function formatPrefsFrom(prefs = []) {
  const out = new Set();
  for (const label of prefs) {
    const key = FORMAT_PREF_ENUM[label];
    if (key) out.add(key);
  }
  return [...out];
}

/**
 * Which ingest type the server wants for a dropped file. Mirrors the
 * accept list below; .gdoc and plain text are sent as text, everything else
 * goes up as base64 (PDFs may be scanned — the server OCRs those).
 */
export function ingestTypeForFile(name) {
  const lower = String(name || "").toLowerCase();
  if (lower.endsWith(".docx")) return "docx";
  if (lower.endsWith(".gdoc")) return "gdoc";
  if (lower.endsWith(".txt") || lower.endsWith(".md")) return "text";
  return "pdf";
}

export const FILE_ACCEPT =
  ".pdf,.docx,.gdoc,.txt,.md,application/pdf," +
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";

export function fileToText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsText(file);
  });
}

/** Human-readable messages for the ingest error codes server/router.js maps. */
export const INGEST_ERRORS = {
  PDF_SCANNED: "That PDF looks scanned and the text could not be read.",
  PDF_EMPTY: "That PDF had no readable text.",
  PDF_MISSING: "That file did not come through. Try again.",
  DOCX_PARSE: "That Word file could not be opened.",
  DOCX_EMPTY: "That Word file had no readable text.",
  GDOC_INVALID: "That does not look like a valid Google Doc link.",
  GDOC_PRIVATE:
    "That Google Doc is private. Share it as “Anyone with the link” and try again.",
  OCR_FAILED: "Addy could not read the text off that scan.",
  BLOCKED_URL: "That link cannot be fetched.",
  BAD_URL: "That does not look like a web address.",
  TOO_LARGE: "That file is too big.",
  EMPTY_SOURCE: "There was no text to read in that.",
  FETCH_FAILED: "That link could not be fetched.",
  LLM_UNCONFIGURED:
    "The OpenRouter key is not set, so Addy used its local reader instead.",
};

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const result = String(reader.result || "");
      // strip the "data:application/pdf;base64," prefix the API does not want
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * The classifier in server/ingest/classify.js tags passages as process /
 * rule_system / definition_cluster. The UI speaks flowchart / checklist /
 * quest, so map between the two vocabularies in one place.
 */
export const FORMAT_BY_CONCEPT = {
  process: "flowchart",
  rule_system: "checklist",
  definition_cluster: "quest",
};

export const formatForConcept = (conceptType) =>
  FORMAT_BY_CONCEPT[conceptType] || "flowchart";

/** ADDY's chat API only accepts these two learner profiles. */
export const learnerFromProfile = (reason, struggles = []) => {
  const r = String(reason || "").toLowerCase();
  if (r === "dyslexia") return "dyslexia";
  if (r === "adhd") return "adhd";
  const dyslexic = struggles.some((s) =>
    /blur|swap|lose my place|re-read/i.test(s),
  );
  return dyslexic ? "dyslexia" : "adhd";
};

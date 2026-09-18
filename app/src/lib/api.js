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
 * payload: { type: "text"|"pdf"|"url"|"sample", text?, url?, sampleId?, filename?, base64? }
 * resolves to { ok, document }
 */
export const ingest = (payload) => call("/api/ingest", json(payload));

/**
 * The server is stateless on Vercel, so the caller keeps `document` in React
 * state and sends it back on every turn rather than trusting documentId.
 */
export const chat = ({ learner, message, documentId, document, history }) =>
  call("/api/chat", json({ learner, message, documentId, document, history }));

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

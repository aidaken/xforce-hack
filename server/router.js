import { ingest } from "./ingest/pipeline.js";
import { SAMPLES } from "./ingest/samples.js";
import { runChat } from "./chat/handler.js";
import { llmReady } from "./env.js";
import { cors, fail, readJson, send } from "./http.js";

export async function handleApi(req, res) {
  if (cors(req, res)) return;

  const url = new URL(req.url, "http://localhost");
  const path = url.pathname.replace(/\/$/, "") || "/";

  try {
    if (req.method === "GET" && path === "/api/health") {
      return send(res, 200, {
        ok: true,
        name: "ADDY",
        llm: llmReady() ? "openrouter" : "heuristic",
        openrouter: llmReady(),
      });
    }

    if (req.method === "GET" && path === "/api/samples") {
      return send(res, 200, {
        ok: true,
        samples: SAMPLES.map((s) => ({
          id: s.id,
          title: s.title,
          excerpt: s.text.slice(0, 180),
        })),
      });
    }

    if (req.method === "POST" && path === "/api/ingest") {
      const payload = await readJson(req);
      const result = await ingest(payload);
      return send(res, 201, result);
    }

    if (req.method === "POST" && path === "/api/chat") {
      const payload = await readJson(req);
      const result = await runChat(payload);
      return send(res, 200, result);
    }

    return fail(res, 404, "NOT_FOUND", "Unknown API route.");
  } catch (err) {
    const code = err.code || "SERVER";
    const status =
      {
        EMPTY_SOURCE: 400,
        BAD_URL: 400,
        BLOCKED_URL: 400,
        TOO_LARGE: 413,
        PDF_MISSING: 400,
        PDF_EMPTY: 422,
        PDF_SCANNED: 422,
        DOCX_PARSE: 422,
        DOCX_EMPTY: 422,
        GDOC_INVALID: 400,
        GDOC_PRIVATE: 403,
        OCR_FAILED: 502,
        UNKNOWN_SAMPLE: 404,
        BAD_LEARNER: 400,
        EMPTY_MESSAGE: 400,
        NO_DOCUMENT: 404,
        LLM_UNCONFIGURED: 503,
        LLM_UPSTREAM: err.status || 502,
        LLM_EMPTY: 502,
        FETCH_FAILED: 502,
      }[code] || 500;
    return fail(res, status, code, err.message);
  }
}

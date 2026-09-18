import { getDocument, saveDocument } from "../store.js";
import { heuristicRemake } from "../llm/heuristic.js";
import { completeChat, llmReady } from "../llm/openrouter.js";
import { LEARNERS, systemPrompt, userPrompt } from "../llm/prompts.js";

export async function runChat(payload) {
  const learner = String(payload.learner || "").toLowerCase();
  if (!LEARNERS.has(learner)) {
    const err = new Error("learner must be adhd or dyslexia.");
    err.code = "BAD_LEARNER";
    throw err;
  }

  const message = String(payload.message || "").trim();
  if (!message) {
    const err = new Error("message is required.");
    err.code = "EMPTY_MESSAGE";
    throw err;
  }

  const document = resolveDocument(payload);
  if (!document) {
    const err = new Error("Ingest a passage first (documentId is missing or expired).");
    err.code = "NO_DOCUMENT";
    throw err;
  }

  const history = Array.isArray(payload.history) ? payload.history.slice(-8) : [];
  const messages = [
    { role: "system", content: systemPrompt(learner, document) },
    ...history
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
      .map((m) => ({ role: m.role, content: String(m.content) })),
    { role: "user", content: userPrompt(learner, message) },
  ];

  if (!llmReady()) {
    const fallback = heuristicRemake(learner, document, message);
    return {
      ok: true,
      llm: "heuristic",
      ready: false,
      learner,
      documentId: document.id,
      format: fallback.format,
      rationale: fallback.rationale,
      text: fallback.text,
      notice:
        "OpenRouter key not set yet. Showing a local remake so the UI can be built. Drop OPENROUTER_API_KEY in .env and this path switches to the model.",
    };
  }

  const completion = await completeChat({ messages, learner });
  const rationale =
    completion.text.split("\n").find((line) => /i chose/i.test(line)) ||
    document.plannerRationale;

  return {
    ok: true,
    llm: "openrouter",
    ready: true,
    learner,
    documentId: document.id,
    model: completion.model,
    rationale,
    text: completion.text,
    usage: completion.usage,
  };
}

function resolveDocument(payload) {
  if (payload.documentId) {
    const existing = getDocument(payload.documentId);
    if (existing) return existing;
  }
  const snapshot = payload.document;
  if (snapshot?.text) {
    return saveDocument({
      id: payload.documentId,
      title: snapshot.title || "Passage",
      sourceType: snapshot.sourceType || "text",
      text: snapshot.text,
      conceptType: snapshot.conceptType || "process",
      plannerRationale: snapshot.plannerRationale || "",
      chunks: snapshot.chunks || [snapshot.text],
    });
  }
  return null;
}

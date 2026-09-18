import { env, llmReady } from "../env.js";

export { llmReady };

export async function completeChat({ messages, learner }) {
  if (!llmReady()) {
    const err = new Error(
      "OPENROUTER_API_KEY is not set. Ingestion still works; chat lights up when the key is in .env.",
    );
    err.code = "LLM_UNCONFIGURED";
    throw err;
  }

  const res = await fetch(`${env.openrouterUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openrouterKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.siteUrl,
      "X-Title": "ADDY",
    },
    body: JSON.stringify({
      model: env.openrouterModel,
      temperature: learner === "adhd" ? 0.25 : 0.15,
      messages,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      body?.error?.message || `OpenRouter returned ${res.status}`,
    );
    err.code = "LLM_UPSTREAM";
    err.status = res.status;
    throw err;
  }

  const text = body?.choices?.[0]?.message?.content;
  if (!text) {
    const err = new Error("OpenRouter returned an empty message.");
    err.code = "LLM_EMPTY";
    throw err;
  }

  return {
    text,
    model: body.model || env.openrouterModel,
    usage: body.usage || null,
  };
}

import { env, llmReady } from "../env.js";

export { llmReady };

export async function completeChat({ messages, learner }) {
  return complete({
    messages,
    temperature: learner === "adhd" ? 0.25 : 0.15,
  });
}

export async function ocrImages(dataUrls) {
  const content = [
    {
      type: "text",
      text: "Transcribe every readable word from these document page images, in reading order. Keep headings and lists. Output plain text only — no commentary.",
    },
    ...dataUrls.map((url) => ({
      type: "image_url",
      image_url: { url },
    })),
  ];
  try {
    const result = await complete({
      messages: [{ role: "user", content }],
      temperature: 0,
    });
    return result.text;
  } catch (err) {
    if (err.code === "LLM_UPSTREAM" || err.code === "LLM_EMPTY") {
      const wrapped = new Error(
        `Could not OCR that scanned PDF. ${err.message}`,
      );
      wrapped.code = "OCR_FAILED";
      wrapped.status = err.status;
      throw wrapped;
    }
    throw err;
  }
}

async function complete({ messages, temperature }) {
  if (!llmReady()) {
    const err = new Error(
      "OPENROUTER_API_KEY is not set. Put it in secrets.toml ([openrouter] api_key) or .env. Ingestion still works without it.",
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
      temperature,
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

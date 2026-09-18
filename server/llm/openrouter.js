import { env, llmReady } from "../env.js";

export { llmReady };

export async function completeChat({ messages, learner }) {
  return complete({
    messages,
    temperature: learner === "adhd" ? 0.25 : 0.15,
  });
}

/** Structured-JSON call for the verifier pipeline. Same client, strict schema. */
export async function completeJson({ messages, temperature = 0, schema, schemaName, maxTokens }) {
  const result = await complete({
    messages,
    temperature,
    maxTokens,
    responseFormat: {
      type: "json_schema",
      json_schema: { name: schemaName, strict: true, schema },
    },
    // Only some providers for this model support structured_outputs. Without
    // these, OpenRouter can route to one that ignores response_format and
    // returns prose-wrapped JSON -- intermittently, as routing shifts with load.
    provider: { require_parameters: true, allow_fallbacks: false },
  });
  try {
    return { ...result, data: JSON.parse(result.text) };
  } catch {
    const err = new Error("OpenRouter returned text that was not valid JSON.");
    err.code = "LLM_BAD_JSON";
    throw err;
  }
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

/**
 * deepseek-v4.1-flash is a REASONING model and reasoning is ON by default.
 * Left uncapped it spends the whole budget on chain-of-thought and never emits
 * an output token, so the call hangs rather than erroring. Measured on a
 * trivial prompt: reasoning on -> 0.4s with content:null; reasoning off ->
 * 0.3s with content:"OK". This is what caused the 300s dyslexia failure on the
 * cellular-respiration sample. max_tokens alone is NOT enough -- that turns the
 * hang into an empty completion.
 */
const REASONING_OFF = { enabled: false };
const DEFAULT_MAX_TOKENS = 16000;
const REQUEST_TIMEOUT_MS = 60000;

async function complete({ messages, temperature, maxTokens, responseFormat, provider }) {
  if (!llmReady()) {
    const err = new Error(
      "OPENROUTER_API_KEY is not set. Put it in secrets.toml ([openrouter] api_key) or .env. Ingestion still works without it.",
    );
    err.code = "LLM_UNCONFIGURED";
    throw err;
  }

  const body_ = {
    model: env.openrouterModel,
    temperature,
    messages,
    reasoning: REASONING_OFF,
    max_tokens: maxTokens || DEFAULT_MAX_TOKENS,
  };
  if (responseFormat) body_.response_format = responseFormat;
  if (provider) body_.provider = provider;

  let res;
  try {
    res = await fetch(`${env.openrouterUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openrouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": env.siteUrl,
        "X-Title": "ADDY",
      },
      body: JSON.stringify(body_),
      // Without a timeout a stalled upstream hangs until Vercel kills the
      // function, which surfaces as an HTML error page instead of JSON.
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (cause) {
    const err = new Error(
      cause.name === "TimeoutError"
        ? `OpenRouter did not respond within ${REQUEST_TIMEOUT_MS / 1000}s.`
        : `Could not reach OpenRouter: ${cause.message}`,
    );
    err.code = "LLM_UPSTREAM";
    err.status = 504;
    throw err;
  }

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

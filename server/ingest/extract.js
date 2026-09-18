import { extractText, getDocumentProxy } from "unpdf";

const MAX_CHARS = 80_000;
const MAX_PDF_BYTES = 8 * 1024 * 1024;
const FETCH_MS = 10_000;

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254",
  "metadata.google.internal",
]);

export async function extractFromPayload(payload) {
  const type = payload.type || payload.sourceType || "text";

  if (type === "sample") {
    throw new Error("SAMPLE_VIA_PIPELINE");
  }

  if (type === "url") {
    return extractUrl(payload.url);
  }

  if (type === "pdf") {
    return extractPdf(payload);
  }

  const text = String(payload.text || "").trim();
  if (!text) {
    const err = new Error("Paste some text, drop a PDF, or pass a URL.");
    err.code = "EMPTY_SOURCE";
    throw err;
  }
  return {
    sourceType: "text",
    title: payload.title || "Pasted text",
    text: clip(text),
  };
}

export async function extractPdf(payload) {
  const buffer = await pdfBuffer(payload);
  if (buffer.byteLength > MAX_PDF_BYTES) {
    const err = new Error("PDF is larger than 8MB.");
    err.code = "TOO_LARGE";
    throw err;
  }
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  const joined = Array.isArray(text) ? text.join("\n") : String(text || "");
  if (!joined.trim()) {
    const err = new Error("Could not read text from that PDF.");
    err.code = "PDF_EMPTY";
    throw err;
  }
  return {
    sourceType: "pdf",
    title: payload.filename || payload.title || "Uploaded PDF",
    text: clip(joined),
  };
}

async function pdfBuffer(payload) {
  if (payload.buffer) return Buffer.from(payload.buffer);
  if (payload.base64) {
    const raw = String(payload.base64).replace(/^data:application\/pdf;base64,/, "");
    return Buffer.from(raw, "base64");
  }
  const err = new Error("PDF upload is missing file bytes.");
  err.code = "PDF_MISSING";
  throw err;
}

export async function extractUrl(rawUrl) {
  let url;
  try {
    url = new URL(String(rawUrl || ""));
  } catch {
    const err = new Error("That URL is not valid.");
    err.code = "BAD_URL";
    throw err;
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    const err = new Error("Only http and https URLs are allowed.");
    err.code = "BAD_URL";
    throw err;
  }
  if (BLOCKED_HOSTS.has(url.hostname) || isPrivateHost(url.hostname)) {
    const err = new Error("That host is blocked.");
    err.code = "BLOCKED_URL";
    throw err;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  let res;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "ADDY-ingest/0.1" },
    });
  } catch {
    const err = new Error("Could not fetch that URL.");
    err.code = "FETCH_FAILED";
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const err = new Error(`URL returned ${res.status}.`);
    err.code = "FETCH_FAILED";
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.byteLength > MAX_PDF_BYTES) {
    const err = new Error("Remote file is larger than 8MB.");
    err.code = "TOO_LARGE";
    throw err;
  }

  if (contentType.includes("pdf") || url.pathname.toLowerCase().endsWith(".pdf")) {
    return extractPdf({ buffer: bytes, title: url.hostname });
  }

  const html = bytes.toString("utf8");
  return {
    sourceType: "url",
    title: titleFromHtml(html) || url.hostname,
    text: clip(htmlToText(html)),
  };
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromHtml(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? htmlToText(match[1]).slice(0, 120) : "";
}

function isPrivateHost(host) {
  return (
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    host.endsWith(".local")
  );
}

function clip(text) {
  const clean = text.replace(/\u0000/g, "").trim();
  if (clean.length <= MAX_CHARS) return clean;
  return `${clean.slice(0, MAX_CHARS)}\n\n[truncated]`;
}

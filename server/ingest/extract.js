import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";
import { ocrScannedPdf } from "./ocr.js";

const MAX_CHARS = 80_000;
const MAX_BYTES = 8 * 1024 * 1024;
const FETCH_MS = 12_000;

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254",
  "metadata.google.internal",
]);

export async function extractFromPayload(payload) {
  const type = resolveType(payload);

  if (type === "sample") {
    throw new Error("SAMPLE_VIA_PIPELINE");
  }

  if (type === "url") {
    return extractUrl(payload.url);
  }

  if (type === "gdoc") {
    return extractGdocFile(payload);
  }

  if (type === "docx") {
    return extractDocx(payload);
  }

  if (type === "pdf") {
    return extractPdf(payload);
  }

  const text = String(payload.text || "").trim();
  if (!text) {
    const err = new Error(
      "Paste some text, drop a PDF / Word / Google Doc file, or pass a URL.",
    );
    err.code = "EMPTY_SOURCE";
    throw err;
  }
  return {
    sourceType: "text",
    title: payload.filename || payload.title || "Pasted text",
    text: clip(text),
  };
}

function resolveType(payload) {
  const filename = String(payload.filename || payload.title || "").toLowerCase();
  let type = payload.type || payload.sourceType || "text";

  if (type === "file" || type === "upload") {
    if (filename.endsWith(".docx")) return "docx";
    if (filename.endsWith(".gdoc")) return "gdoc";
    if (filename.endsWith(".pdf")) return "pdf";
    if (filename.endsWith(".txt") || filename.endsWith(".md")) return "text";
    return "pdf";
  }

  if (filename.endsWith(".docx") && type !== "url") return "docx";
  if (filename.endsWith(".gdoc") && type !== "url") return "gdoc";
  return type;
}

export async function extractPdf(payload) {
  const buffer = await fileBuffer(payload);
  if (buffer.byteLength > MAX_BYTES) fail("TOO_LARGE", "PDF is larger than 8MB.");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  const joined = Array.isArray(text) ? text.join("\n") : String(text || "");
  const layer = joined.trim();
  const body = layer || (await ocrScannedPdf(pdf));
  return {
    sourceType: "pdf",
    title: payload.filename || payload.title || "Uploaded PDF",
    text: clip(body),
  };
}

export async function extractDocx(payload) {
  const buffer = await fileBuffer(payload);
  if (buffer.byteLength > MAX_BYTES) fail("TOO_LARGE", "Word file is larger than 8MB.");
  let extracted;
  try {
    extracted = await mammoth.extractRawText({ buffer });
  } catch {
    fail("DOCX_PARSE", "Could not read that Word document.");
  }
  const text = String(extracted?.value || "").trim();
  if (!text) fail("DOCX_EMPTY", "That Word document has no readable text.");
  return {
    sourceType: "docx",
    title: payload.filename || payload.title || "Uploaded Word doc",
    text: clip(text),
  };
}

export async function extractGdocFile(payload) {
  const raw =
    payload.text ||
    (payload.base64
      ? Buffer.from(stripDataUrl(payload.base64), "base64").toString("utf8")
      : payload.buffer
        ? Buffer.from(payload.buffer).toString("utf8")
        : "");
  let json;
  try {
    json = JSON.parse(String(raw));
  } catch {
    fail(
      "GDOC_INVALID",
      "That .gdoc file is not valid. Export the Google Doc as .docx, or paste a public docs.google.com link.",
    );
  }
  const url =
    json.url ||
    (json.doc_id ? `https://docs.google.com/document/d/${json.doc_id}/edit` : "");
  if (!url) {
    fail(
      "GDOC_INVALID",
      "That .gdoc file has no document URL. Share the Doc as 'Anyone with the link' and paste the URL.",
    );
  }
  return extractUrl(url);
}

export async function extractUrl(rawUrl) {
  const url = parseHttpUrl(rawUrl);
  const googleExport = googleExportUrl(url);
  const target = googleExport || url;

  const bytes = await fetchBytes(target);
  const contentType = bytes.contentType;
  const body = bytes.buffer;

  if (googleExport) {
    const text = body.toString("utf8");
    if (googleDenied(text, contentType)) {
      fail(
        "GDOC_PRIVATE",
        "That Google Doc is not public. Share it as 'Anyone with the link can view', then try again.",
      );
    }
    const plain = contentType.includes("html") ? htmlToText(text) : text.trim();
    if (!plain) fail("GDOC_PRIVATE", "That Google Doc returned no text.");
    return {
      sourceType: "gdoc",
      title: "Google Doc",
      text: clip(plain),
    };
  }

  const path = url.pathname.toLowerCase();
  if (
    contentType.includes("pdf") ||
    path.endsWith(".pdf")
  ) {
    return extractPdf({ buffer: body, title: url.hostname });
  }
  if (
    contentType.includes("officedocument.wordprocessingml") ||
    path.endsWith(".docx")
  ) {
    return extractDocx({ buffer: body, title: fileNameFromUrl(url) || url.hostname });
  }

  const html = body.toString("utf8");
  return {
    sourceType: "url",
    title: titleFromHtml(html) || url.hostname,
    text: clip(htmlToText(html)),
  };
}

export function googleExportUrl(url) {
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "docs.google.com") return null;

  const published = url.pathname.match(/\/document\/d\/e\/([^/]+)/);
  if (published) {
    return new URL(
      `https://docs.google.com/document/d/e/${published[1]}/pub?output=txt`,
    );
  }

  const standard = url.pathname.match(
    /\/document\/(?:u\/\d+\/)?d\/(?!e\/)([a-zA-Z0-9_-]+)/,
  );
  if (standard) {
    return new URL(
      `https://docs.google.com/document/d/${standard[1]}/export?format=txt`,
    );
  }
  return null;
}

function fileNameFromUrl(url) {
  const part = url.pathname.split("/").filter(Boolean).pop() || "";
  try {
    return decodeURIComponent(part);
  } catch {
    return part;
  }
}

function parseHttpUrl(rawUrl) {
  let url;
  try {
    url = new URL(String(rawUrl || ""));
  } catch {
    fail("BAD_URL", "That URL is not valid.");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    fail("BAD_URL", "Only http and https URLs are allowed.");
  }
  if (BLOCKED_HOSTS.has(url.hostname) || isPrivateHost(url.hostname)) {
    fail("BLOCKED_URL", "That host is blocked.");
  }
  return url;
}

async function fetchBytes(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  let res;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "ADDY-ingest/0.1",
        Accept: "text/plain, application/pdf, */*;q=0.8",
      },
    });
  } catch {
    fail("FETCH_FAILED", "Could not fetch that URL.");
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const host = url.hostname.replace(/^www\./, "");
    if (
      host === "docs.google.com" &&
      (res.status === 401 || res.status === 403 || res.status === 404 || res.status === 410)
    ) {
      fail(
        "GDOC_PRIVATE",
        "ADDY could not open that Google Doc. Share it as 'Anyone with the link can view' (or publish to the web), then try again.",
      );
    }
    fail("FETCH_FAILED", `URL returned ${res.status}.`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    fail("TOO_LARGE", "Remote file is larger than 8MB.");
  }
  return {
    buffer,
    contentType: res.headers.get("content-type") || "",
  };
}

function googleDenied(text, contentType) {
  const head = text.slice(0, 4000).toLowerCase();
  return (
    head.includes("accounts.google.com") ||
    head.includes("you need access") ||
    head.includes("request access") ||
    (contentType.includes("html") &&
      head.includes("signin") &&
      head.includes("google"))
  );
}

async function fileBuffer(payload) {
  if (payload.buffer) return Buffer.from(payload.buffer);
  if (payload.base64) {
    return Buffer.from(stripDataUrl(payload.base64), "base64");
  }
  fail("PDF_MISSING", "Upload is missing file bytes.");
}

function stripDataUrl(raw) {
  const s = String(raw);
  const marker = "base64,";
  const i = s.indexOf(marker);
  return i >= 0 ? s.slice(i + marker.length) : s;
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

function fail(code, message) {
  const err = new Error(message);
  err.code = code;
  throw err;
}

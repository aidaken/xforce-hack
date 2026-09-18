/**
 * Client-side PDF text extraction.
 *
 * The file never leaves the browser: we pull the text layer out here and post
 * only the text to /api/ingest. That is why "Upload a PDF" can accept 40 MB
 * while the server keeps its 8 MB upload cap — a 40 MB scanned-looking
 * textbook chapter becomes a few kilobytes of text before it touches the
 * network.
 *
 * pdf.js comes from `unpdf`, which ships a worker-free build that runs in the
 * browser. It is behind a dynamic import so the ~1.6 MB bundle only downloads
 * when someone actually picks a PDF.
 */

export const PDF_MAX_BYTES = 40 * 1024 * 1024;

/** Read this many pages at most. A whole textbook is not a reading. */
const MAX_PAGES = 80;

/** Under this many characters per page there is no real text layer. */
const SCANNED_CHARS_PER_PAGE = 40;

/** Top / bottom slice of the page a running head or foot can live in. */
const BAND = 0.08;

export function isPdfFile(file) {
  if (!file) return false;
  const name = String(file.name || "").toLowerCase();
  return name.endsWith(".pdf") || file.type === "application/pdf";
}

/** "bio-ch3_final.pdf" → "bio ch3 final" — a title, not a filename. */
export function titleFromFilename(name) {
  const base = String(name || "")
    .replace(/\.pdf$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!base) return "Uploaded PDF";
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/**
 * Resolves to { text, scanned, pages, totalPages, truncated }.
 * `scanned: true` means the file is page images with no text layer — the
 * caller tells the reader that plainly instead of sending an empty passage.
 */
export async function extractPdfText(file, { onPage } = {}) {
  const buffer = await file.arrayBuffer();
  let pdf;
  try {
    const { getDocumentProxy } = await import("unpdf");
    pdf = await getDocumentProxy(new Uint8Array(buffer));
  } catch (err) {
    const wrapped = new Error("That PDF could not be opened.");
    wrapped.code = "PDF_UNREADABLE";
    wrapped.cause = err;
    throw wrapped;
  }

  const totalPages = pdf.numPages || 0;
  const readTo = Math.min(totalPages, MAX_PAGES);
  const pages = [];
  try {
    for (let n = 1; n <= readTo; n += 1) {
      const page = await pdf.getPage(n);
      const view = page.view || [0, 0, 612, 792];
      const height = Math.abs(view[3] - view[1]) || 792;
      const content = await page.getTextContent();
      pages.push({ height, lines: toLines(content.items || []) });
      if (onPage) onPage(n, readTo);
    }
  } finally {
    try {
      await pdf.destroy?.();
    } catch {
      // A failed teardown is not worth failing the upload over.
    }
  }

  const running = runningHeads(pages);
  const blocks = [];
  for (const page of pages) {
    const body = page.lines.filter((line) => !isFurniture(line, page, running));
    const paragraphs = toParagraphs(body);
    if (paragraphs.length) blocks.push(paragraphs.join("\n\n"));
  }

  const text = blocks.join("\n\n").trim();
  const scanned = !text || text.length < Math.max(1, readTo) * SCANNED_CHARS_PER_PAGE;

  return {
    text,
    scanned,
    pages: readTo,
    totalPages,
    truncated: totalPages > readTo,
  };
}

/* ---------- lines ---------- */

/**
 * pdf.js hands back positioned glyph runs, not lines. Bucket them by baseline,
 * then read each bucket left to right, inserting a space wherever the runs
 * were visually apart.
 */
function toLines(items) {
  const buckets = [];
  for (const item of items) {
    const str = typeof item.str === "string" ? item.str : "";
    if (!str.length) continue;
    const t = item.transform || [];
    const glyph = {
      x: Number(t[4]) || 0,
      y: Number(t[5]) || 0,
      w: Number(item.width) || 0,
      h: Math.abs(Number(t[3]) || Number(item.height) || 12) || 12,
      str,
    };
    const tol = Math.max(2, glyph.h * 0.4);
    const line = buckets.find((b) => Math.abs(b.y - glyph.y) <= tol);
    if (line) line.items.push(glyph);
    else buckets.push({ y: glyph.y, items: [glyph] });
  }

  return buckets
    .sort((a, b) => b.y - a.y)
    .map((bucket) => {
      const glyphs = bucket.items.sort((a, b) => a.x - b.x);
      let text = "";
      let prev = null;
      for (const g of glyphs) {
        if (prev) {
          const gap = g.x - (prev.x + prev.w);
          const wide = gap > Math.max(1, prev.h * 0.2);
          if (wide && !/\s$/.test(text) && !/^\s/.test(g.str)) text += " ";
        }
        text += g.str;
        prev = g;
      }
      const first = glyphs[0];
      const last = glyphs[glyphs.length - 1];
      return {
        y: bucket.y,
        h: first.h,
        x0: first.x,
        x1: last.x + last.w,
        text: text.replace(/\s+/g, " ").trim(),
      };
    })
    .filter((line) => line.text.length > 0);
}

/* ---------- headers, footers, page numbers ---------- */

const PAGE_NUMBER =
  /^(page\s*)?\d{1,4}$|^\d{1,4}\s*(of|\/)\s*\d{1,4}$|^[-–—]\s*\d{1,4}\s*[-–—]$|^[ivxlcdm]{1,6}$/i;

/** Digits become # so "Page 3" and "Page 4" count as the same running head. */
const normalize = (s) =>
  s
    .toLowerCase()
    .replace(/\d+/g, "#")
    .replace(/[^a-z#]+/g, " ")
    .trim();

function runningHeads(pages) {
  const tally = new Map();
  for (const page of pages) {
    const seen = new Set();
    for (const line of page.lines) {
      if (!inBand(line, page)) continue;
      const key = normalize(line.text);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      tally.set(key, (tally.get(key) || 0) + 1);
    }
  }
  const needed = Math.max(2, Math.ceil(pages.length * 0.5));
  const repeated = new Set();
  for (const [key, n] of tally) if (n >= needed) repeated.add(key);
  return repeated;
}

function inBand(line, page) {
  const band = page.height * BAND;
  return line.y > page.height - band || line.y < band;
}

function isFurniture(line, page, running) {
  if (!inBand(line, page)) return false;
  if (PAGE_NUMBER.test(line.text.trim())) return true;
  return running.has(normalize(line.text));
}

/* ---------- paragraphs ---------- */

const BULLET = /^\s*([-•*–▪]|\d{1,2}[.)]|[a-z][.)])\s+/i;

/**
 * Rejoin wrapped lines into paragraphs. A break is a wide vertical gap, a
 * short line that already ended a sentence, a fresh indent, or a bullet.
 */
function toParagraphs(lines) {
  if (!lines.length) return [];

  const gaps = [];
  for (let i = 1; i < lines.length; i += 1) gaps.push(lines[i - 1].y - lines[i].y);
  const median = gaps.length
    ? [...gaps].sort((a, b) => a - b)[Math.floor(gaps.length / 2)]
    : 0;
  const widest = Math.max(...lines.map((l) => l.x1 - l.x0), 1);

  const paragraphs = [];
  let current = "";
  let prev = null;

  for (const line of lines) {
    let split = false;
    if (prev) {
      const gap = prev.y - line.y;
      const shortLine = prev.x1 - prev.x0 < widest * 0.62;
      const ended = /[.!?:;"'’”)\]]$/.test(prev.text);
      if (median > 0 && gap > median * 1.6) split = true;
      if (shortLine && ended) split = true;
      if (line.x0 > prev.x0 + Math.max(8, line.h)) split = true;
      if (BULLET.test(line.text)) split = true;
    }

    if (!prev || split) {
      if (current.trim()) paragraphs.push(current.trim());
      current = line.text;
    } else if (/[a-z]-$/.test(current)) {
      current = current.slice(0, -1) + line.text;
    } else if (/^[,.;:!?)\]]/.test(line.text)) {
      current += line.text;
    } else {
      current += ` ${line.text}`;
    }
    prev = line;
  }

  if (current.trim()) paragraphs.push(current.trim());
  return paragraphs;
}

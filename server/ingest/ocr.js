import { PNG } from "pngjs";
import { extractImages, renderPageAsImage } from "unpdf";
import { llmReady } from "../env.js";
import { ocrImages } from "../llm/openrouter.js";

const MAX_PAGES = 3;
const MAX_IMAGES = 4;
const MIN_PIXELS = 80 * 80;

export async function ocrScannedPdf(pdf) {
  const dataUrls = await collectPageImages(pdf);
  if (!dataUrls.length) {
    const err = new Error(
      "This PDF has no text layer, and ADDY could not find page images to OCR.",
    );
    err.code = "PDF_EMPTY";
    throw err;
  }
  if (!llmReady()) {
    const err = new Error(
      "This PDF looks scanned. Vision OCR needs OPENROUTER_API_KEY in secrets.toml or Vercel env.",
    );
    err.code = "PDF_SCANNED";
    throw err;
  }

  const text = await ocrImages(dataUrls);
  if (!String(text || "").trim()) {
    const err = new Error("OCR ran but found no text on those pages.");
    err.code = "PDF_EMPTY";
    throw err;
  }
  return text;
}

async function collectPageImages(pdf) {
  const pages = Math.min(Number(pdf.numPages) || 1, MAX_PAGES);
  const dataUrls = [];

  for (let page = 1; page <= pages && dataUrls.length < MAX_IMAGES; page++) {
    const rendered = await tryRenderPage(pdf, page);
    if (rendered) {
      dataUrls.push(rendered);
      continue;
    }

    const images = await extractImages(pdf, page).catch(() => []);
    const biggest = [...images].sort(
      (a, b) => b.width * b.height - a.width * a.height,
    );
    for (const img of biggest) {
      if (img.width * img.height < MIN_PIXELS) continue;
      dataUrls.push(`data:image/png;base64,${rawToPngBase64(img)}`);
      if (dataUrls.length >= MAX_IMAGES) break;
    }
  }

  return dataUrls;
}

async function tryRenderPage(pdf, pageNumber) {
  try {
    const url = await renderPageAsImage(pdf, pageNumber, {
      canvasImport: () => import("@napi-rs/canvas"),
      toDataURL: true,
      scale: 1.2,
    });
    return typeof url === "string" && url.startsWith("data:") ? url : null;
  } catch {
    return null;
  }
}

function rawToPngBase64(img, maxWidth = 1024) {
  const srcW = img.width;
  const srcH = img.height;
  const channels = img.channels;
  const src = img.data;
  const scale = srcW > maxWidth ? maxWidth / srcW : 1;
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));
  const png = new PNG({ width, height });

  for (let y = 0; y < height; y++) {
    const sy = Math.min(srcH - 1, Math.floor(y / scale));
    for (let x = 0; x < width; x++) {
      const sx = Math.min(srcW - 1, Math.floor(x / scale));
      const si = (sy * srcW + sx) * channels;
      const di = (y * width + x) * 4;
      if (channels === 1) {
        png.data[di] = png.data[di + 1] = png.data[di + 2] = src[si];
        png.data[di + 3] = 255;
      } else if (channels === 3) {
        png.data[di] = src[si];
        png.data[di + 1] = src[si + 1];
        png.data[di + 2] = src[si + 2];
        png.data[di + 3] = 255;
      } else {
        png.data[di] = src[si];
        png.data[di + 1] = src[si + 1];
        png.data[di + 2] = src[si + 2];
        png.data[di + 3] = src[si + 3] ?? 255;
      }
    }
  }

  return PNG.sync.write(png).toString("base64");
}

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import "./env.js";
import { env } from "./env.js";
import { handleApi } from "./router.js";

const publicDir = join(import.meta.dirname, "..", "public");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${env.port}`);
  if (url.pathname.startsWith("/api/")) {
    req.url = url.pathname + url.search;
    return handleApi(req, res);
  }
  serveStatic(url.pathname, res);
});

function serveStatic(pathname, res) {
  let rel = pathname === "/" ? "/index.html" : pathname;
  if (rel === "/app") rel = "/app.html";
  const file = normalize(join(publicDir, rel));
  if (!file.startsWith(publicDir) || !existsSync(file) || statSync(file).isDirectory()) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Not found");
    return;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", TYPES[extname(file)] || "application/octet-stream");
  createReadStream(file).pipe(res);
}

server.listen(env.port, () => {
  console.log(`ADDY  http://localhost:${env.port}`);
  console.log(`chat  http://localhost:${env.port}/app`);
  console.log(
    env.openrouterKey
      ? "OpenRouter: ready"
      : "OpenRouter: waiting for OPENROUTER_API_KEY (heuristic remakes until then)",
  );
});

import { handleApi } from "../server/router.js";
import "../server/env.js";

export default async function handler(req, res) {
  const url = req.url?.startsWith("/api/")
    ? req.url
    : `/api${req.url === "/" ? "" : req.url}`;
  req.url = url;
  return handleApi(req, res);
}

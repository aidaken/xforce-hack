import { handleApi } from "../server/router.js";
import "../server/env.js";

export default async function handler(req, res) {
  req.url = "/api/ingest";
  return handleApi(req, res);
}

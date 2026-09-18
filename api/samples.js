import { handleApi } from "../server/router.js";
import "../server/env.js";

export default async function handler(req, res) {
  req.url = "/api/samples";
  return handleApi(req, res);
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { codigoValido, soloPost } from "../lib/ia";

export const config = { runtime: "nodejs" };

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!soloPost(req, res)) return;
  if (!codigoValido(req)) {
    res.status(401).json({ error: "Ese código no es el de la clase." });
    return;
  }
  res.status(200).json({ ok: true });
}

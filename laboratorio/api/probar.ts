import type { VercelRequest, VercelResponse } from "@vercel/node";
import { FALLBACK, MODELO_CHAT, codigoValido, ia, mensajeDeError, soloPost } from "../lib/ia";

export const config = { runtime: "nodejs" };

const MAX = 14000;

/** Probador: recibe el prompt ya armado por la persona y devuelve la respuesta en streaming de texto plano. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!soloPost(req, res)) return;
  if (!codigoValido(req)) {
    res.status(401).json({ error: "Ese código no es el de la clase." });
    return;
  }
  const prompt = String((req.body || {}).prompt || "").trim();
  if (!prompt || prompt.length > MAX) {
    res.status(400).json({ error: "El prompt está vacío o es demasiado largo." });
    return;
  }
  try {
    const stream = ia().beta.messages.stream({
      model: MODELO_CHAT,
      max_tokens: 4000,
      output_config: { effort: "low" },
      system: "Responde en español de Colombia. Eres un asistente para quienes trabajan en derecho disciplinario y sancionatorio. Nunca inventes hechos, normas, artículos ni sentencias: si no puedes sustentar una cita, márcala con [verificar]. No resuelvas la valoración de la prueba, la calificación de la falta ni la sanción. Tu respuesta es un borrador para revisión del profesional responsable.",
      messages: [{ role: "user", content: prompt }],
      ...FALLBACK,
    });
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");
    for await (const ev of stream) {
      if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") res.write(ev.delta.text);
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") res.write("\n\n[La IA no quiso responder esta solicitud. Prueba a reformularla.]");
    if (final.stop_reason === "max_tokens") res.write("\n\n[La respuesta se cortó por extensión. Pide un entregable más corto.]");
    res.end();
  } catch (err) {
    console.error(err);
    const { status, error } = mensajeDeError(err);
    if (!res.headersSent) res.status(status).json({ error });
    else { res.write(`\n\n[${error}]`); res.end(); }
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { FALLBACK, MODELO, codigoValido, ia, mensajeDeError, sistemaCacheado, soloPost } from "../lib/ia";
import { SISTEMA, TAREAS, esquemaPrompts, limpiarPerfil, mensajeUsuario } from "../lib/biblioteca";

export const config = { runtime: "nodejs" };

/** Un lote = una tarea. El navegador pide varios lotes en paralelo y va pintando cada uno cuando llega. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!soloPost(req, res)) return;
  if (!codigoValido(req)) {
    res.status(401).json({ error: "Ese código no es el de la clase." });
    return;
  }
  const body = (req.body || {}) as Record<string, unknown>;
  const perfil = limpiarPerfil((body.perfil || {}) as Record<string, unknown>);
  const tarea = String(body.tarea || "");
  const cantidad = Math.max(1, Math.min(3, Number(body.cantidad) || 2));
  const parte = Math.max(1, Math.min(3, Number(body.parte) || 1));
  const pedido = String(body.pedido || "").trim().slice(0, 600);
  if (!perfil || !TAREAS[tarea]) {
    res.status(400).json({ error: "Faltan el área, el rol o el tipo de tarea." });
    return;
  }
  try {
    const r = await ia().beta.messages.parse({
      model: MODELO,
      max_tokens: 14000,
      output_config: { effort: "low", format: betaZodOutputFormat(esquemaPrompts) },
      system: sistemaCacheado(SISTEMA),
      messages: [{ role: "user", content: mensajeUsuario(perfil, TAREAS[tarea], cantidad, parte, pedido) }],
      ...FALLBACK,
    });
    if (!r.parsed_output) throw new Error("sin salida");
    res.status(200).json({ tarea, parte, prompts: r.parsed_output.prompts });
  } catch (err) {
    console.error(err);
    const { status, error } = mensajeDeError(err);
    res.status(status).json({ error });
  }
}

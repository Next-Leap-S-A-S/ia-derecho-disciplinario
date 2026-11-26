import type { VercelRequest, VercelResponse } from "@vercel/node";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { FALLBACK, MODELO, codigoValido, ia, mensajeDeError, sistemaCacheado, soloPost } from "../lib/ia";
import { SISTEMA_EXPANDIR, esquemaExpandido, limpiarPerfil, mensajeExpandir } from "../lib/biblioteca";

export const config = { runtime: "nodejs" };

const corto = (v: unknown) => String(v ?? "").trim().slice(0, 2500);

/** Laboratorio: recibe un borrador corto de rol, contexto e instruccion y lo devuelve extendido, con sangria. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!soloPost(req, res)) return;
  if (!codigoValido(req)) {
    res.status(401).json({ error: "Ese código no es el de la clase." });
    return;
  }
  const b = (req.body || {}) as Record<string, unknown>;
  const borrador = { rol: corto(b.rol), contexto: corto(b.contexto), instruccion: corto(b.instruccion) };
  if (!borrador.rol && !borrador.contexto && !borrador.instruccion) {
    res.status(400).json({ error: "Escribe al menos una idea en rol, contexto o instrucción." });
    return;
  }
  const perfil = b.perfil && typeof b.perfil === "object" ? limpiarPerfil(b.perfil as Record<string, unknown>) : null;
  try {
    const r = await ia().beta.messages.parse({
      model: MODELO,
      max_tokens: 8000,
      output_config: { effort: "low", format: betaZodOutputFormat(esquemaExpandido) },
      system: sistemaCacheado(SISTEMA_EXPANDIR),
      messages: [{ role: "user", content: mensajeExpandir(borrador, perfil) }],
      ...FALLBACK,
    });
    if (!r.parsed_output) throw new Error("sin salida");
    res.status(200).json(r.parsed_output);
  } catch (err) {
    console.error(err);
    const { status, error } = mensajeDeError(err);
    res.status(status).json({ error });
  }
}

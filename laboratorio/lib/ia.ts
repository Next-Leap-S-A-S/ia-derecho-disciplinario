import Anthropic from "@anthropic-ai/sdk";
import { timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export const MODELO = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
/** Modelo del probador. Se puede cambiar por variable de entorno si hay saturación o para bajar el costo. */
export const MODELO_CHAT = process.env.ANTHROPIC_MODEL_CHAT || MODELO;

// Si el modelo declina una solicitud, la API la reintenta en otro modelo.
export const FALLBACK = {
  betas: ["server-side-fallback-2026-07-01"] as Anthropic.Beta.AnthropicBeta[],
  fallbacks: "default" as const,
};

let cliente: Anthropic | null = null;
export function ia(): Anthropic {
  // Las llaves de usuario (sk-ant-usr) no traen workspace: se indica aparte.
  const ws = process.env.ANTHROPIC_WORKSPACE_ID;
  if (!cliente) cliente = new Anthropic({ maxRetries: 4, defaultHeaders: ws ? { "anthropic-workspace-id": ws } : undefined });
  return cliente;
}

function iguales(a: string, b: string): boolean {
  const x = new Uint8Array(Buffer.from(a, "utf8"));
  const y = new Uint8Array(Buffer.from(b, "utf8"));
  if (x.length !== y.length) {
    timingSafeEqual(x, x);
    return false;
  }
  return timingSafeEqual(x, y);
}

/** Codigo de la clase que se proyecta en la sala. Se compara sin distinguir mayusculas. */
export function codigoValido(req: VercelRequest): boolean {
  const esperado = (process.env.CLASS_CODE || "").trim().toUpperCase();
  if (!esperado) return false;
  const dado = String(req.headers["x-clase"] || "").trim().toUpperCase();
  return iguales(esperado, dado);
}

/** System prompt como bloque cacheable: los turnos siguientes reutilizan el prefijo. */
export function sistemaCacheado(texto: string): Anthropic.Beta.BetaTextBlockParam[] {
  return [{ type: "text", text: texto, cache_control: { type: "ephemeral" } }];
}

export function soloPost(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === "POST") return true;
  res.status(405).json({ error: "Usa POST." });
  return false;
}

export function mensajeDeError(err: unknown): { status: number; error: string } {
  if (err instanceof Anthropic.RateLimitError) {
    return { status: 429, error: "Hay mucha gente usando la IA al mismo tiempo. Intenta de nuevo en unos segundos." };
  }
  if (err instanceof Anthropic.AuthenticationError) {
    return { status: 500, error: "La llave de la IA no está configurada en el servidor." };
  }
  if (err instanceof Anthropic.APIError) {
    return { status: 502, error: `La IA respondió con un error (${err.status ?? "sin estado"}). Intenta de nuevo.` };
  }
  return { status: 500, error: "Error inesperado en el servidor." };
}

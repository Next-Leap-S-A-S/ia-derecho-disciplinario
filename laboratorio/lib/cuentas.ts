import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

let cliente: NeonQueryFunction<false, false> | null = null;
let lista = false;

export function sql(): NeonQueryFunction<false, false> {
  if (!cliente) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("SIN_BD");
    cliente = neon(url);
  }
  return cliente;
}

/** Crea la tabla la primera vez que alguien se registra. */
export async function asegurarTabla(): Promise<void> {
  if (lista) return;
  await sql().query(`CREATE TABLE IF NOT EXISTS usuarios (
    id serial PRIMARY KEY,
    correo text UNIQUE NOT NULL,
    nombre text NOT NULL,
    sal text NOT NULL,
    pin_hash text NOT NULL,
    intentos int NOT NULL DEFAULT 0,
    bloqueado_hasta timestamptz,
    datos jsonb NOT NULL DEFAULT '{}'::jsonb,
    creado timestamptz NOT NULL DEFAULT now(),
    actualizado timestamptz NOT NULL DEFAULT now()
  )`);
  lista = true;
}

export function hashPin(pin: string, sal: string): Promise<string> {
  return new Promise((ok, mal) => scrypt(pin, sal, 32, (e, k) => (e ? mal(e) : ok(k.toString("hex")))));
}
export const nuevaSal = () => randomBytes(16).toString("hex");

export async function pinCorrecto(pin: string, sal: string, hash: string): Promise<boolean> {
  const a = new Uint8Array(Buffer.from(await hashPin(pin, sal), "hex"));
  const b = new Uint8Array(Buffer.from(hash, "hex"));
  return a.length === b.length && timingSafeEqual(a, b);
}

function secreto(): string {
  const s = process.env.SIGNING_SECRET;
  if (!s) throw new Error("SIN_SECRETO");
  return s;
}
const DIAS = 60;

/** Token sin estado: id.vence.firma */
export function firmar(id: number): string {
  const vence = Math.floor(Date.now() / 1000) + DIAS * 86400;
  const base = `${id}.${vence}`;
  return `${base}.${createHmac("sha256", secreto()).update(base).digest("base64url")}`;
}
export function verificar(token: string): number | null {
  const [id, vence, firma] = String(token || "").split(".");
  if (!id || !vence || !firma) return null;
  const esperada = createHmac("sha256", secreto()).update(`${id}.${vence}`).digest("base64url");
  const a = new Uint8Array(Buffer.from(firma)), b = new Uint8Array(Buffer.from(esperada));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(vence) < Date.now() / 1000) return null;
  return Number(id);
}

export const CORREO = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
export const PIN = /^\d{4,8}$/;

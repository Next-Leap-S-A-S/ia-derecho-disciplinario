import type { VercelRequest, VercelResponse } from "@vercel/node";
import { codigoValido, soloPost } from "../lib/ia";
import { CORREO, PIN, asegurarTabla, firmar, hashPin, nuevaSal, pinCorrecto, sql, verificar } from "../lib/cuentas";

export const config = { runtime: "nodejs" };

const MAX_DATOS = 900_000;
const MAX_INTENTOS = 5;

/**
 * Mini registro: nombre, correo y PIN. Una sola ruta con acciones:
 * registrar, entrar (requieren el código de la clase), cargar y guardar (requieren el token).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!soloPost(req, res)) return;
  const b = (req.body || {}) as Record<string, unknown>;
  const accion = String(b.accion || "");
  try {
    await asegurarTabla();

    if (accion === "registrar" || accion === "entrar") {
      if (!codigoValido(req)) return void res.status(401).json({ error: "Código de la clase incorrecto." });
      const correo = String(b.correo || "").trim().toLowerCase();
      const pin = String(b.pin || "");
      if (!CORREO.test(correo)) return void res.status(400).json({ error: "Escribe un correo válido." });
      if (!PIN.test(pin)) return void res.status(400).json({ error: "El PIN son de 4 a 8 números." });

      if (accion === "registrar") {
        const nombre = String(b.nombre || "").trim().slice(0, 120);
        if (!nombre) return void res.status(400).json({ error: "Escribe tu nombre." });
        const datos = JSON.stringify(b.datos && typeof b.datos === "object" ? b.datos : {});
        if (datos.length > MAX_DATOS) return void res.status(413).json({ error: "Tu biblioteca es demasiado grande." });
        const sal = nuevaSal();
        const hash = await hashPin(pin, sal);
        const r = await sql().query(
          "INSERT INTO usuarios (correo, nombre, sal, pin_hash, datos) VALUES ($1,$2,$3,$4,$5::jsonb) ON CONFLICT (correo) DO NOTHING RETURNING id",
          [correo, nombre, sal, hash, datos],
        );
        if (!r.length) return void res.status(409).json({ error: "Ese correo ya está registrado. Usa «Ya tengo cuenta»." });
        return void res.status(200).json({ token: firmar(r[0].id), nombre });
      }

      const f = await sql().query("SELECT id, nombre, sal, pin_hash, intentos, bloqueado_hasta, datos FROM usuarios WHERE correo = $1", [correo]);
      const u = f[0];
      const generico = { error: "Correo o PIN incorrectos." };
      if (!u) return void res.status(401).json(generico);
      if (u.bloqueado_hasta && new Date(u.bloqueado_hasta).getTime() > Date.now()) {
        return void res.status(429).json({ error: "Demasiados intentos. Espera 10 minutos." });
      }
      if (!(await pinCorrecto(pin, u.sal, u.pin_hash))) {
        await sql().query(
          "UPDATE usuarios SET intentos = intentos + 1, bloqueado_hasta = CASE WHEN intentos + 1 >= $2 THEN now() + interval '10 minutes' ELSE bloqueado_hasta END WHERE id = $1",
          [u.id, MAX_INTENTOS],
        );
        return void res.status(401).json(generico);
      }
      await sql().query("UPDATE usuarios SET intentos = 0, bloqueado_hasta = NULL WHERE id = $1", [u.id]);
      return void res.status(200).json({ token: firmar(u.id), nombre: u.nombre, datos: u.datos });
    }

    if (accion === "cargar" || accion === "guardar") {
      const id = verificar(String(req.headers["x-token"] || ""));
      if (!id) return void res.status(401).json({ error: "Tu sesión venció. Vuelve a entrar." });
      if (accion === "cargar") {
        const f = await sql().query("SELECT nombre, datos FROM usuarios WHERE id = $1", [id]);
        if (!f.length) return void res.status(401).json({ error: "Cuenta no encontrada." });
        return void res.status(200).json({ nombre: f[0].nombre, datos: f[0].datos });
      }
      const datos = JSON.stringify(b.datos && typeof b.datos === "object" ? b.datos : {});
      if (datos.length > MAX_DATOS) return void res.status(413).json({ error: "Tu biblioteca es demasiado grande." });
      await sql().query("UPDATE usuarios SET datos = $2::jsonb, actualizado = now() WHERE id = $1", [id, datos]);
      return void res.status(200).json({ ok: true });
    }

    res.status(400).json({ error: "Acción no válida." });
  } catch (err) {
    const m = err instanceof Error ? err.message : "";
    console.error(err);
    if (m === "SIN_BD" || m === "SIN_SECRETO") {
      return void res.status(503).json({ error: "El registro aún no está activo en el servidor." });
    }
    res.status(500).json({ error: "No pude completar la operación. Intenta de nuevo." });
  }
}

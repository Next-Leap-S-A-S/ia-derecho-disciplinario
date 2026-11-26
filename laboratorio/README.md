# Laboratorio de prompts disciplinarios

Taller «Entre el prompt y la sanción», VII Congreso de Derecho Disciplinario y Sancionatorio, Tunja 2026.

Cada persona elige frente de trabajo, temas, rol, enfoque, régimen, experiencia con IA y tono. Claude genera sus prompts RCI (Rol, Contexto, Instrucción). La persona los edita, los prueba, los guarda y los descarga en PDF. Incluye los 24 ejemplos de la clase y un laboratorio con medidor de calidad y detector de datos personales.

- `public/` página estática.
- `api/generar.ts` un lote por tipo de tarea, salida estructurada con zod.
- `api/expandir.ts` extiende un borrador corto.
- `api/probar.ts` probador en streaming.
- `lib/biblioteca.ts` instrucciones del sistema y reglas de rigor jurídico.
- `public/js/libreria.js` se genera con `python3 src/build.py` desde `src/prompts-disciplinario.js`. No se edita a mano.

## Publicar en Vercel

Desde esta carpeta:

```bash
vercel link
vercel env add ANTHROPIC_API_KEY production
vercel env add CLASS_CODE production
vercel env add SIGNING_SECRET production
vercel deploy --prod
```

`DATABASE_URL` (Neon) activa el mini registro con correo y PIN. Sin ella, los prompts quedan guardados en el navegador de cada persona.

El modelo por defecto es `claude-opus-5-5`. Se cambia con `ANTHROPIC_MODEL` y `ANTHROPIC_MODEL_CHAT`.

Código base: la biblioteca de prompts a la medida del taller de la Universidad Externado.

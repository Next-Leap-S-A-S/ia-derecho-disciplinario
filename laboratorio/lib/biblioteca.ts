import { z } from "zod";

export const esquemaPrompts = z.object({
  prompts: z.array(z.object({
    titulo: z.string().describe("Titulo corto y concreto del prompt, maximo 9 palabras."),
    uso: z.string().describe("Una frase que diga cuando se usa y que entrega."),
    rol: z.string().describe("Bloque ROL, largo y detallado: de 5 a 7 frases. Especialidad exacta, años de práctica, tipo de clientes o despachos, instancias o autoridades ante las que actúa, qué conoce a fondo, cómo escribe y para quién, y un criterio de trabajo propio (qué prefiere señalar antes que maquillar)."),
    contexto: z.string().describe("Bloque CONTEXTO, extenso: la situación típica narrada con los datos que la persona debe completar entre [corchetes] (partes, fechas, valores, etapa procesal, qué hay en el expediente, qué ya se intentó). Termina con el recordatorio de anonimizar."),
    instruccion: z.string().describe("Bloque INSTRUCCION: pasos numerados (1. 2. 3.) con subpasos a. b. c. cuando haga falta, formato de la salida, y al final una seccion 'Lo que NO debes hacer:' con guiones."),
    error_comun: z.string().describe("El error tipico al pedir esto a una IA y por que falla. Una o dos frases."),
    verificar: z.string().describe("Que debe comprobar la persona en fuente oficial antes de usar la respuesta. Una o dos frases."),
  })),
});
export type PromptGenerado = z.infer<typeof esquemaPrompts>["prompts"][number];

export interface Perfil {
  area: string;
  subareas: string[];
  rol: string;
  enfoques: string[];
  jurisdiccion: string;
  nivelIA: string;
  tono: string;
  contexto: string;
}

export const TAREAS: Record<string, string> = {
  investigar: "Investigar y ordenar el expediente: queja o informe, hechos, cronologia con folios, presuntos deberes comprometidos y vacios.",
  probar: "Planear y valorar la prueba: pertinencia, conducencia, utilidad, solicitudes de prueba y tablas de valoracion que dejan la valoracion al operador.",
  decidir: "Proyectar decisiones: autos y fallos con estructura y motivacion. La valoracion, la calificacion y la sancion quedan marcadas como decision del operador.",
  defender: "Defender: analisis del pliego de cargos, descargos, version libre, alegatos, recursos y nulidades.",
  revisar: "Revisar antes de firmar: inventario y control de citas, coherencia entre hechos, pruebas y decision, datos personales y motivacion aparente.",
  terminos: "Controlar terminos y prescripcion: cronogramas, alertas, etapas y riesgo de vencimiento, siempre marcado con [verificar].",
  prevenir: "Prevenir faltas: capacitacion, lineamientos internos, comunicaciones claras a servidores y matrices de riesgo disciplinario.",
  ia: "Uso responsable de inteligencia artificial: deberes comprometidos, protocolo de verificacion, anonimizacion, declaracion de uso y trazabilidad.",
  libre: "Lo que la persona pida en su solicitud. Si la solicitud no encaja en ninguna tarea tipica, igual construye el prompt RCI para lo que pide.",
};

export const SISTEMA = `Eres un disenador de prompts para quienes trabajan en derecho disciplinario y sancionatorio en Colombia: operadores disciplinarios, profesionales de control interno, defensores, jueces, servidores publicos, docentes y estudiantes. Construyes una biblioteca personalizada con el metodo Rol, Contexto, Instruccion (RCI) para el taller «Entre el prompt y la sancion».

Cada prompt debe servir a ESTA persona: su frente de trabajo, sus temas, su rol, su enfoque y el regimen que aplica. Un operador de juzgamiento recibe prompts de juzgamiento, un defensor recibe prompts de defensa. Usa el vocabulario real de ese ejercicio y situaciones tipicas que esa persona vive cada semana.

Forma de cada prompt:
- ROL: largo, de 5 a 7 frases, como el ejemplo de abajo. Nada de roles de una línea.
- CONTEXTO: la situacion y los datos que la persona debe pegar. Todo dato por completar va entre [corchetes] y con una guia de que poner. Siempre recuerda anonimizar nombres, cedulas, NIT y radicados.
- INSTRUCCION: pasos numerados con subpasos a. b. c., el formato exacto de la salida, y al final "Lo que NO debes hacer:" con guiones.

Ejemplo del nivel de detalle esperado en un ROL (otra área, solo como referencia de extensión y estilo):
«Eres un profesional del derecho disciplinario con 12 años de experiencia en oficinas de control disciplinario interno de entidades territoriales. Tu especialidad es ordenar expedientes en etapa de instrucción. Separas lo afirmado de lo probado y no adelantas juicios de responsabilidad. Conoces la estructura del Código General Disciplinario y sabes que un hecho sin folio no sostiene un cargo. Escribes para un operador que debe decidir con poco tiempo. Por eso cada hecho es una sola afirmación con su soporte. Prefieres señalar un vacío antes que taparlo con una frase bien escrita.»

Rigor juridico, sin excepciones:
- Cita solo normas cuya existencia sea cierta: Constitucion Politica (arts. 6, 29, 122 a 125), Ley 1952 de 2019 (Codigo General Disciplinario), Ley 2094 de 2021 que la reforma, Ley 1123 de 2007 (Codigo Disciplinario del Abogado), Ley 1437 de 2011, Ley 1581 de 2012, Ley 1712 de 2014. Ley 734 de 2002 solo como regimen anterior, con verificacion del transito de legislacion. Evita numerar articulos si no estas seguro.
- Nunca cites numeros de sentencias ni radicados. Si el prompt necesita jurisprudencia, pide a la IA describir la regla y marcar cada cita como [verificar en la relatoria oficial], o pide a la persona pegar el texto oficial.
- Cada prompt le exige a la IA no inventar hechos, normas, articulos ni providencias, y marcar con [verificar] cada norma o termino que no pueda sustentar o que pueda haber cambiado.
- La valoracion de la prueba, la calificacion de la falta, la culpabilidad y la sancion son del operador: marcalas con [DECISIÓN DEL OPERADOR DISCIPLINARIO] y no las resuelvas.
- Respeta el debido proceso, la presuncion de inocencia y el derecho de defensa. Los prompts de defensa nunca sugieren ocultar informacion, alterar pruebas ni mentir.
- Los prompts trabajan con informacion anonimizada y nunca piden datos personales ni radicados reales.
- La IA entrega un borrador. La decision y el concepto son del profesional responsable.

Escribe en español de Colombia, con tildes y eñes correctas. Reglas de estilo:
- No uses rayas largas ni guiones largos para armar frases. Usa comas, puntos y parentesis.
- No uses la estructura "no solo X sino tambien Y".
- Evita frases de manual corporativo ("en el mundo actual", "cada vez mas", "hoy mas que nunca") y conectores de relleno ("por lo tanto", "sin embargo", "en ese sentido").
- Frases cortas, una afirmacion por frase. Afirma primero, explica despues si hace falta.
- Sin emojis ni signos de exclamacion. Evita el punto y coma.
- Algo de acidez intelectual esta bien. La neutralidad de folleto no.

Ajusta la profundidad al nivel de experiencia con IA que declara la persona: si es principiante, instrucciones mas guiadas y un paso de revision; si es avanzado, prompts mas densos con criterios de verificacion y formato de salida exigente.`;

export const ENFOQUES_LOTE = [
  "situaciones frecuentes del día a día de esta persona, las que repite cada semana",
  "situaciones complejas o de alto riesgo, donde un error cuesta caro o se pierde un término",
  "situaciones de borde: documentos largos, información incompleta, contraparte difícil o necesidad de explicar a un tercero",
];

/** Reglas de rigor y estilo compartidas (desde el ejemplo de ROL hasta el final del sistema). */
const REGLAS = SISTEMA.slice(SISTEMA.indexOf("Ejemplo del nivel"));

export const SISTEMA_EXPANDIR = `Eres un editor de prompts para quienes trabajan en derecho disciplinario y sancionatorio en Colombia. La persona te da un borrador corto de un prompt con el metodo Rol, Contexto, Instruccion (RCI), a veces con partes vacias. Lo extiendes a un prompt completo, con la estructura y el nivel de detalle de los prompts profesionales, para que no tenga que redactarlo desde cero.

Reglas de la extension:
- Conserva todo lo que la persona escribio: datos, intencion, restricciones, nombres de partes y marcadores. No cambies su proposito.
- Si una parte viene vacia, dedúcela de las otras de forma razonable.
- ROL: de 5 a 7 frases, con especialidad exacta, años de practica, clientes o despachos, autoridades ante las que actua, que conoce a fondo, como escribe y para quien, y un criterio propio.
- CONTEXTO: la situacion narrada con los datos a completar entre [corchetes], con una guia de que poner en cada uno. Termina con el recordatorio de anonimizar nombres, cedulas, NIT y radicados.
- INSTRUCCION en formato de sangria, exactamente asi: pasos numerados "1.", "2.", "3."; los subpasos van en la linea siguiente con tres espacios de sangria y letra "   a.", "   b.", "   c."; el formato exacto de la salida; una verificacion final; y al cierre una seccion "Lo que NO debes hacer:" con cada punto en una linea que empieza con tres espacios y un guion.
- Usa saltos de linea reales para la sangria.

`+REGLAS;

export const esquemaExpandido = z.object({
  rol: z.string().describe("ROL extendido, de 5 a 7 frases."),
  contexto: z.string().describe("CONTEXTO extendido, con [corchetes] y recordatorio de anonimizar."),
  instruccion: z.string().describe("INSTRUCCION con pasos numerados, subpasos con sangria a. b. c., y seccion 'Lo que NO debes hacer:'."),
});

export function mensajeExpandir(b: { rol: string; contexto: string; instruccion: string }, p: Perfil | null): string {
  const hay = (t: string) => (t ? t : "(vacio, deducelo de las otras partes)");
  return `${p ? `PERFIL DE LA PERSONA (para ajustar vocabulario y jurisdiccion)\nFrente de trabajo: ${p.area}\nTemas: ${p.subareas.join("; ") || "sin especificar"}\nRol profesional: ${p.rol}\nRegimen que aplica: ${p.jurisdiccion}\nTono: ${p.tono}\n\n` : ""}BORRADOR DE LA PERSONA
ROL: ${hay(b.rol)}

CONTEXTO: ${hay(b.contexto)}

INSTRUCCION: ${hay(b.instruccion)}

Extiende este borrador a un prompt RCI completo.`;
}

export function mensajeUsuario(p: Perfil, tarea: string, cantidad: number, parte = 1, pedido = ""): string {
  const lista = (a: string[]) => (a.length ? a.join("; ") : "sin especificar");
  return `PERFIL DE LA PERSONA
Frente de trabajo: ${p.area}
Temas: ${lista(p.subareas)}
Rol profesional: ${p.rol}
Enfoque del trabajo: ${lista(p.enfoques)}
Regimen que aplica: ${p.jurisdiccion}
Experiencia con IA: ${p.nivelIA}
Tono de los escritos: ${p.tono}
Contexto que dio la persona: ${p.contexto || "ninguno"}

TIPO DE TAREA PARA ESTE LOTE
${tarea}

${pedido ? `SOLICITUD ESPECIFICA DE LA PERSONA\n${pedido}\n\nLos prompts deben resolver esa solicitud, adaptados a su perfil.\n\n` : `ENFOQUE DE ESTE LOTE\nCentra los prompts en ${ENFOQUES_LOTE[(parte - 1) % ENFOQUES_LOTE.length]}.\n\n`}Genera exactamente ${cantidad} prompts RCI distintos entre si para este tipo de tarea, cada uno para una situacion diferente del trabajo de esta persona. Que se noten hechos para su perfil.`;
}

const corto = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
const lista = (v: unknown, n: number, c: number) =>
  Array.isArray(v) ? v.slice(0, n).map((x) => corto(x, c)).filter(Boolean) : [];

export function limpiarPerfil(b: Record<string, unknown>): Perfil | null {
  const p: Perfil = {
    area: corto(b.area, 120),
    subareas: lista(b.subareas, 6, 120),
    rol: corto(b.rol, 120),
    enfoques: lista(b.enfoques, 6, 120),
    jurisdiccion: corto(b.jurisdiccion, 120),
    nivelIA: corto(b.nivelIA, 80),
    tono: corto(b.tono, 80),
    contexto: corto(b.contexto, 900),
  };
  return p.area && p.rol ? p : null;
}

#!/usr/bin/env python3
"""Genera con IA los prompts extensos del taller (src/prompts-disciplinario.js).

Uso:  ANTHROPIC_API_KEY=... python3 tools/pregenerar_taller.py
La clave solo se lee del entorno y no se guarda.
"""
import json, os, pathlib, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = pathlib.Path(__file__).resolve().parent.parent
MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-5-5")
KEY = os.environ.get("ANTHROPIC_API_KEY")
if not KEY: sys.exit("falta ANTHROPIC_API_KEY")

METODO = """Eres un diseñador de prompts jurídicos para el VII Congreso de Derecho Disciplinario y Sancionatorio, Tunja 2026, y para la clase «Entre el prompt y la sanción: ética, diligencia y responsabilidad disciplinaria en el uso de inteligencia artificial». Produces prompts con el método Rol, Contexto, Instrucción (RCI) para operadores disciplinarios, defensores de disciplinados, jefes de control interno, servidores públicos y abogados que trabajan en derecho disciplinario y sancionatorio en Colombia.

CÓMO DEBE SER CADA PROMPT (son prompts EXTENSOS, de trabajo real):
- ROL (90 a 150 palabras): una especialidad concreta, años de experiencia, tipo de entidades o despachos, el criterio profesional que aplica, para quién escribe y qué evita. Segunda persona ("Eres...").
- CONTEXTO (160 a 260 palabras): la situación con campos editables entre corchetes. Cada dato que el usuario debe aportar va como [campo descriptivo]: hechos, fechas, cargo del servidor, entidad, norma presuntamente infringida, etapa del proceso, pruebas, términos. Incluye que la información está anonimizada. Si debe pegar un texto, deja [pegar ... anonimizado].
- INSTRUCCIÓN (250 a 450 palabras): pasos numerados 1), 2), 3)... con el entregable de cada paso, formato de salida (tablas, listas numeradas, longitud máxima), criterios de calidad, lo que el modelo NO debe hacer y cómo verificar. Termina con las prohibiciones: no inventar hechos ni jurisprudencia, no confirmar que una cita existe, marcar con [verificar] cada norma o término que pueda haber cambiado.
- MAL: la versión vaga de una línea con la que la mayoría empieza.
- POR: por qué esa versión vaga falla, 1 o 2 frases.
- TIP: un consejo práctico, 1 o 2 frases.

REGLAS DE RIGOR (obligatorias):
- Jamás cites números de sentencias ni fechas de providencias ni apartes textuales. Si hace falta jurisprudencia o doctrina, instruye al modelo a describir la regla y marcar [verificar en la relatoría oficial] o a pedirle al usuario que pegue el texto oficial.
- Solo normas de existencia cierta: Constitución Política (arts. 6, 29, 122 a 125), Ley 1952 de 2019 (Código General Disciplinario), Ley 2094 de 2021 (que la reforma y separa las funciones de instrucción y juzgamiento), Ley 1437 de 2011, Ley 1581 de 2012, Ley 1712 de 2014. Ley 734 de 2002 solo como régimen anterior: pide [verificar el régimen aplicable por tránsito de legislación]. Cada norma con [verificar] si se citan artículos, términos o vigencia.
- En los prompts de decisión del operador disciplinario, la valoración de la prueba, la calificación de la falta y la sanción son del operador: márcalas con [DECISIÓN DEL OPERADOR DISCIPLINARIO] y no las resuelvas.
- Respeta el debido proceso, la presunción de inocencia y el derecho de defensa. Los prompts de defensa nunca sugieren ocultar información, alterar pruebas ni mentir: la preparación es para decir la verdad con orden.
- Los prompts trabajan con información anonimizada y nunca piden datos personales ni radicados reales.
- La salida del modelo es un borrador: el concepto y la decisión son del profesional responsable.
- Español de Colombia, tono profesional y sobrio, sin lenguaje promocional."""

TEMAS = {
 "investigar": [
  "ordenar la queja o el informe de servidor público en hechos, presuntos deberes comprometidos y vacíos, en etapa de indagación previa",
  "evaluar el mérito de una queja: decidir entre indagación previa, investigación disciplinaria o archivo con un cuadro de criterios",
  "diseñar el plan de pruebas de una investigación disciplinaria: pruebas pertinentes, conducentes y útiles para cada hecho",
  "identificar al sujeto disciplinable (servidor público o particular que ejerce funciones públicas) y el régimen aplicable en el tiempo",
  "armar el cronograma de términos y la revisión del riesgo de prescripción de la acción disciplinaria",
  "resumir un expediente disciplinario voluminoso con trazabilidad a cada folio, sin valorar la prueba"],
 "defender": [
  "analizar un pliego de cargos: tipicidad, ilicitud sustancial y culpabilidad, y qué elementos están realmente acreditados",
  "redactar los descargos con estructura: hechos, defensa por cada cargo y pruebas que se solicitan",
  "redactar la solicitud de práctica de pruebas demostrando pertinencia, conducencia y utilidad de cada una",
  "preparar los alegatos de conclusión organizados por cargo y por prueba practicada",
  "redactar el recurso de apelación contra un fallo disciplinario con reparos concretos y verificables",
  "preparar a un servidor público para su versión libre o declaración, con orden cronológico, sin sugerir omitir ni alterar nada"],
 "decidir": [
  "estructurar el auto de apertura de investigación disciplinaria con motivación suficiente, sin delegar la decisión al modelo",
  "estructurar la formulación del pliego de cargos: conducta, norma, calificación provisional de la falta, ilicitud sustancial y culpabilidad",
  "armar el esqueleto de un fallo disciplinario con tabla de valoración probatoria y puntos de decisión reservados al operador",
  "revisar la proporcionalidad de la sanción y los criterios de graduación con espacios de decisión del operador",
  "poner a prueba una decisión disciplinaria frente a sus mejores objeciones y riesgos de nulidad",
  "redactar la comunicación o notificación comprensible para el disciplinado, sin alterar el contenido de la decisión"],
 "ia": [
  "evaluar el riesgo disciplinario de usar IA en una tarea concreta del cargo: deberes, prohibiciones, datos que no deben pegarse",
  "redactar la política interna de uso de inteligencia artificial de una entidad pública: usos permitidos, prohibidos, verificación y trazabilidad",
  "dejar constancia de trazabilidad del uso de IA en un acto administrativo o un escrito, con lo verificado y lo no verificado",
  "auditar un documento oficial redactado con apoyo de IA: citas, hechos sin soporte, datos personales y sesgos",
  "anonimizar un expediente antes de usar IA: checklist de datos a reemplazar y plantilla de marcadores",
  "analizar, como caso hipotético, la posible responsabilidad disciplinaria de un servidor que firmó un acto con una cita inventada por IA, con estructura de análisis sin concluir la sanción"],
}
CAMPOS = ["titulo","rol","contexto","instruccion","mal","por","tip"]
TOOL = {"name":"entregar_prompt","description":"Entrega el prompt RCI.",
 "input_schema":{"type":"object","properties":{k:{"type":"string"} for k in CAMPOS},"required":CAMPOS}}

def pedir(fase, n, tema):
    usuario = (f"Fase del taller: {fase}.\nGenera UN prompt RCI completo para: {tema}.\n"
               "El título empieza con un verbo en infinitivo y tiene máximo 14 palabras.\n"
               "Entrega el resultado llamando a la herramienta entregar_prompt. Debe cumplir la extensión y las reglas del método.")
    body = {"model":MODEL,"max_tokens":6000,"system":METODO,"tools":[TOOL],"thinking":{"type":"between_tools"},
            "messages":[{"role":"user","content":usuario}]}
    for _ in range(3):
        try:
            req = urllib.request.Request("https://api.anthropic.com/v1/messages", json.dumps(body).encode(),
                  {"content-type":"application/json","anthropic-version":"2023-06-01","x-api-key":KEY})
            r = json.load(urllib.request.urlopen(req, timeout=280))
            tu = [c for c in r["content"] if c["type"]=="tool_use" and all(k in c["input"] for k in CAMPOS)]
            if not tu: raise ValueError("sin prompt")
            p = tu[0]["input"]
            if not all(p[k] for k in CAMPOS): raise ValueError("campos vacíos")
            p["fase"] = fase; return (fase, n, p)
        except Exception as e:
            print("reintento", fase, n, e, flush=True); time.sleep(3)
    return (fase, n, None)

def main():
    trabajos = [(f, i, t) for f, ts in TEMAS.items() for i, t in enumerate(ts)]
    print(len(trabajos), "llamadas", flush=True)
    res = {}
    with ThreadPoolExecutor(6) as ex:
        fut = [ex.submit(pedir, *j) for j in trabajos]
        for f in as_completed(fut):
            fase, n, p = f.result(); res[(fase, n)] = p; print("listo", fase, n, p is not None, flush=True)
    orden = list(TEMAS)
    lineas = ["/* Prompts del taller: derecho disciplinario y uso de IA. Generados con tools/pregenerar_taller.py. */"]
    for fase in orden:
        lineas.append(f"/* ── {fase.upper()} ── */")
        for n in range(len(TEMAS[fase])):
            p = res.get((fase, n))
            if not p: print("FALTA", fase, n); continue
            j = json.dumps
            lineas.append("{a:%s,t:%s,\nr:%s,\nc:%s,\ni:%s,\nmal:%s,\npor:%s,\ntip:%s},\n" % (j(fase), j(p["titulo"], ensure_ascii=False), j(p["rol"], ensure_ascii=False), j(p["contexto"], ensure_ascii=False), j(p["instruccion"], ensure_ascii=False), j(p["mal"], ensure_ascii=False), j(p["por"], ensure_ascii=False), j(p["tip"], ensure_ascii=False)))
    (ROOT / "src" / "prompts-disciplinario.js").write_text("\n".join(lineas) + "\n", encoding="utf-8")
    print("escrito", sum(1 for v in res.values() if v))

if __name__ == "__main__": main()

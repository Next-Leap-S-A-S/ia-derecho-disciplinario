#!/usr/bin/env python3
"""Ensambla index.html y taller-prompts.html a partir de src/.

- template.html        : marcado y logica (UTF-8, legible)
- prompts-*.js         : biblioteca, un archivo por area (orden: civil, comercial, laboral, penal,
                         administrativo, constitucional)
- rondas.js            : rondas del ejercicio
- assets/*.woff2, .png : tipografias y logo, se incrustan en base64 (el hero es solo CSS)
- modulo4.html         : presentacion del Modulo 4 (vibecoding), se copia a modulo-4.html

El resultado es un unico archivo ASCII puro: fuera de <script> los caracteres
no ASCII van como entidades HTML (&#NNNN;) y dentro de <script> como \\uXXXX.
Uso:  python3 src/build.py
"""
import base64, pathlib, re, sys

SRC = pathlib.Path(__file__).resolve().parent
ROOT = SRC.parent
OUT = ROOT / "taller-prompts.html"


def b64(path):
    return base64.b64encode(path.read_bytes()).decode("ascii")

def font_css():
    faces = [("IBM Plex Mono", 400, "ibmplexmono-400.woff2"),
             ("IBM Plex Mono", 500, "ibmplexmono-500.woff2"),
             ("Inter", 400, "inter-400.woff2"),
             ("Inter", 500, "inter-500.woff2"),
             ("Inter", 600, "inter-600.woff2")]
    out = []
    for fam, w, fn in faces:
        out.append("@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:swap;"
                   "src:url(data:font/woff2;base64,%s) format('woff2');}" % (fam, w, b64(SRC / "assets" / fn)))
    return "\n".join(out)

def inst_band():
    t = (SRC / "inst_band.html").read_text(encoding="utf-8")
    return t.replace("{{NL_LOGO}}", "data:image/png;base64," + b64(SRC / "assets" / "nextleap-mark.png"))

def prompts_js():
    return (SRC / "prompts-disciplinario.js").read_text(encoding="utf-8").strip()

def esc_html(s):
    return "".join(c if ord(c) < 128 else "&#%d;" % ord(c) for c in s)

def esc_js(s):
    out = []
    for c in s:
        o = ord(c)
        if o < 128:
            out.append(c)
        elif o <= 0xFFFF:
            out.append("\\u%04x" % o)
        else:
            o -= 0x10000
            out.append("\\u%04x\\u%04x" % (0xD800 + (o >> 10), 0xDC00 + (o & 0x3FF)))
    return "".join(out)

def esc_css(s):
    # Escape CSS de 6 digitos: no necesita espacio de cierre.
    return "".join(c if ord(c) < 128 else "\\%06x" % ord(c) for c in s)

def asciify(html):
    # Separa bloques <script> y <style> del resto y escapa cada uno a su manera.
    out, pos = [], 0
    for m in re.finditer(r"<(script|style)\b[^>]*>.*?</\1>", html, flags=re.S):
        out.append(esc_html(html[pos:m.start()]))
        out.append((esc_js if m.group(1) == "script" else esc_css)(m.group(0)))
        pos = m.end()
    out.append(esc_html(html[pos:]))
    return "".join(out)

def main():
    tpl = (SRC / "template.html").read_text(encoding="utf-8")
    html = (tpl.replace("{{INST_BAND}}", inst_band()).replace("{{FONT_CSS}}", font_css())
               .replace("{{LOGO_PNG}}", "data:image/png;base64," + b64(SRC / "assets" / "nextleap-mark.png"))
               .replace("{{PROMPTS}}", prompts_js())
               .replace("{{RONDAS}}", (SRC / "rondas.js").read_text(encoding="utf-8").strip()))
    left = re.findall(r"\{\{[A-Z_]+\}\}", html)
    if left:
        sys.exit(f"placeholders sin resolver: {left}")
    html = asciify(html)
    assert all(ord(c) < 128 for c in html), "quedaron caracteres no ASCII"
    OUT.write_text(html, encoding="ascii")
    hub = (SRC / "hub.html").read_text(encoding="utf-8")
    hub = (hub.replace("{{INST_BAND}}", inst_band()).replace("{{FONT_CSS}}", font_css())
              .replace("{{LOGO_PNG}}", "data:image/png;base64," + b64(SRC / "assets" / "nextleap-mark.png")))
    (ROOT / "index.html").write_text(asciify(hub), encoding="ascii")
    (ROOT / "laboratorio" / "public" / "js" / "libreria.js").write_text(
        "/* Generado por src/build.py desde src/prompts-disciplinario.js. No editar a mano. */\n"
        'window.LIB_AREAS=[["investigar","Investigar"],["defender","Defender"],["decidir","Decidir"],["ia","Uso responsable de IA"]];\n'
        "window.LIBRERIA=[\n" + prompts_js() + "\n];\n", encoding="utf-8")
    n = len(re.findall(r'^\{a:"', prompts_js(), flags=re.M))
    print(f"ok: {OUT} ({OUT.stat().st_size:,} bytes, {n} prompts)")

if __name__ == "__main__":
    main()

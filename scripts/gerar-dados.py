#!/usr/bin/env python3
"""Café Príncipe: gera worker/pratos.json e sitemap.xml a partir do MENU do index.html.
Corre sempre que mudares um prato ou um preço:  python scripts/gerar-dados.py
Avisa se um prato ficar sem tradução ou se um endereço antigo deixar de existir (links já partilhados deixam de funcionar)."""
import json, re, unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
html = (RAIZ / "index.html").read_text(encoding="utf8")
menu = html[html.index("const MENU = {"):html.index("/* ============ UTILITÁRIOS")]
dominio = re.search(r'<link rel="canonical" href="(https://[^"/]+)/">', html)[1]


def slug(t):
    t = "".join(c for c in unicodedata.normalize("NFD", t) if not unicodedata.combining(c)).lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")


pratos = {}
for nome, desc, preco in re.findall(r'nome:"([^"]+)", desc:"([^"]*)", preco:([\d.]+)', menu):
    s, n = slug(nome), float(preco)
    foto = RAIZ / "img" / "og" / (s + ".jpg")
    pratos[s] = {"nome": nome, "desc": desc, "preco": int(n) if n.is_integer() else n,
                 "img": "/img/og/" + s + ".jpg" if foto.exists() else "/og-image.jpg"}

destino = RAIZ / "worker" / "pratos.json"
antigos = set(json.loads(destino.read_text(encoding="utf8"))) if destino.exists() else set()
destino.write_text(json.dumps(pratos, ensure_ascii=False, indent=1) + "\n", encoding="utf8")

urls = [dominio + "/"] + [f"{dominio}/prato/{s}" for s in pratos]
(RAIZ / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join(f"  <url><loc>{u}</loc></url>\n" for u in urls) + "</urlset>\n", encoding="utf8")

print(f"{len(pratos)} pratos gerados.")
for s in sorted(antigos - set(pratos)):
    print(f"AVISO: o endereço /prato/{s} deixou de existir.")
traducoes = html[html.index("const MENU_I18N = {"):html.index("const META_DESC = {")]
for p in pratos.values():
    if json.dumps(p["nome"], ensure_ascii=False) + ":" not in traducoes:
        print(f"AVISO: \"{p['nome']}\" não tem tradução em MENU_I18N.")

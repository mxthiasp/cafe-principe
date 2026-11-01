#!/usr/bin/env python3
"""Café Príncipe: prepara o site antes de cada commit.   Corre:  python scripts/gerar-dados.py

1. Gera worker/pratos.json e sitemap.xml a partir do menu (js/menu.js).
2. Verifica os dados e avisa de erros (prato sem tradução, foto que não existe, preço mal escrito, nomes repetidos, textos sem tradução).
3. Escreve um número de versão nos links de css/js do index.html e no sw.js, para os telemóveis nunca misturarem ficheiros velhos com novos.
Sai com código 1 se encontrar ERROS (os AVISOS não bloqueiam)."""
import hashlib, json, re, sys, unicodedata
from html.parser import HTMLParser
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ler = lambda *p: (RAIZ.joinpath(*p)).read_text(encoding="utf8")
html = ler("index.html")
menu_txt = ler("js", "menu.js")
menu = menu_txt[menu_txt.index("const MENU = {"):]
dominio = re.search(r'<link rel="canonical" href="(https://[^"/]+)/">', html)[1]
erros, avisos = [], []


def slug(t):
    t = "".join(c for c in unicodedata.normalize("NFD", t) if not unicodedata.combining(c)).lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")


# ---------- 1. pratos.json e sitemap.xml ----------
pratos = {}
for nome, desc, preco in re.findall(r'nome:"([^"]+)", desc:"([^"]*)", preco:([\d.]+)', menu):
    s, n = slug(nome), float(preco)
    if s in pratos:
        erros.append(f'O nome "{nome}" está repetido no menu (o endereço /prato/{s} só pode ser de um prato).')
    foto = RAIZ / "img" / "og" / (s + ".jpg")
    pratos[s] = {"nome": nome, "desc": desc, "preco": int(n) if n.is_integer() else n,
                 "img": "/img/og/" + s + ".jpg" if foto.exists() else "/og-image.jpg"}
total_linhas = len(re.findall(r"\bnome:", menu))
if total_linhas != len(re.findall(r'nome:"[^"]+", desc:"[^"]*", preco:[\d.]+', menu)):
    erros.append("Há pratos em js/menu.js com o formato errado (esperado: nome:\"...\", desc:\"...\", preco:12.5). Confirma aspas e vírgulas.")

destino = RAIZ / "worker" / "pratos.json"
antigos = set(json.loads(destino.read_text(encoding="utf8"))) if destino.exists() else set()
destino.write_text(json.dumps(pratos, ensure_ascii=False, indent=1) + "\n", encoding="utf8")
urls = [dominio + "/"] + [f"{dominio}/prato/{s}" for s in pratos]
(RAIZ / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join(f"  <url><loc>{u}</loc></url>\n" for u in urls) + "</urlset>\n", encoding="utf8")
print(f"{len(pratos)} pratos gerados.")
for s in sorted(antigos - set(pratos)):
    avisos.append(f"o endereço /prato/{s} deixou de existir (links já partilhados vão dar erro).")

# ---------- 2. verificação dos dados ----------
trad = ler("js", "traducoes.js")


def objeto(nome):
    """junta tudo o que 'Object.assign(NOME, {...});' acrescenta, já como dicionário"""
    r = {}
    for m in re.finditer(r"^Object\.assign\(" + nome + r", (\{.*\})\);\s*$", trad, re.M):
        try:
            r.update(json.loads(m.group(1)))
        except ValueError:
            erros.append(f"js/traducoes.js: não consegui ler um bloco de {nome} (confirma vírgulas e aspas).")
    return r


menu_i18n, cat_i18n, dicionario = objeto("MENU_I18N"), objeto("CAT_I18N"), objeto("DICT")
for p in pratos.values():
    t = menu_i18n.get(p["nome"])
    if not t:
        erros.append(f'"{p["nome"]}" não tem tradução em MENU_I18N (js/traducoes.js).')
        continue
    for campo, rot in (("n", "nome"), ("d", "descrição")):
        v = t.get(campo)
        if not isinstance(v, list) or len(v) != 4 or (not all(isinstance(x, str) for x in v)) or (campo == "n" and not all(v)):
            erros.append(f'"{p["nome"]}": a tradução do {rot} tem de ter as 4 línguas (inglês, francês, alemão, espanhol).')
    if p["desc"] and isinstance(t.get("d"), list) and not all(t["d"]):
        avisos.append(f'"{p["nome"]}": a descrição está vazia em alguma língua.')
    if p["preco"] < 0:
        erros.append(f'"{p["nome"]}": o preço não pode ser negativo.')
for cat in re.findall(r'^  "([^"]+)": \[', menu, re.M):
    if cat not in cat_i18n:
        erros.append(f'A categoria "{cat}" não tem tradução em CAT_I18N (js/traducoes.js).')
# fotos
for f in set(re.findall(r'RAIZ \+ "(img/[^"]+)"', menu_txt)):
    if not (RAIZ / f).exists():
        erros.append(f"a foto {f} está em js/menu.js mas o ficheiro não existe.")
# textos do site sem tradução
UI = ["ui-base", "ui-menu", "ui-pedido", "ui-pesquisa", "ui-topo"]   # ficheiros do funcionamento do site (por esta ordem)
app = "\n".join(ler("js", n + ".js") for n in UI)
chaves = set(re.findall(r'\bT\("((?:[^"\\]|\\.)*)"\)', app)) | set(re.findall(r"\bT\('((?:[^'\\]|\\.)*)'\)", app))


class Textos(HTMLParser):
    ignorar = {"script", "style", "svg", "title"}

    def __init__(s):
        super().__init__(); s.pilha, s.textos = [], set()

    def handle_starttag(s, tag, a):
        if tag not in ("meta", "link", "br", "img", "input", "path", "use", "circle", "rect", "g", "defs"): s.pilha.append(tag)

    def handle_endtag(s, tag):
        if tag in s.pilha:
            while s.pilha and s.pilha.pop() != tag: pass

    def handle_data(s, d):
        if not s.ignorar.intersection(s.pilha):
            t = " ".join(d.split())
            if len(t) > 2 and re.search(r"[A-Za-zÀ-ÿ]{3}", t): s.textos.add(t)


x = Textos(); x.feed(html)
semtrad = sorted(t for t in (chaves | x.textos) if t not in dicionario and not re.fullmatch(r"[\W\d_]*", t))
IGNORAR = {"Café Príncipe", "PT", "EN", "FR", "DE", "ES", "Brito", "Guimarães", "Português", "English", "Français", "Deutsch", "Español"}
semtrad = [t for t in semtrad if t not in IGNORAR and "{" not in t or (t in dicionario)]
for t in semtrad[:25]:
    avisos.append(f'texto sem tradução em DICT: "{t[:70]}"')
if len(semtrad) > 25:
    avisos.append(f"... e mais {len(semtrad) - 25} textos sem tradução.")


# ---------- 2b. menu para o Google (dados estruturados no index.html) ----------
def menu_ld():
    seccoes = []
    partes = re.split(r'^  "([^"]+)": \[\s*$', menu, flags=re.M)
    for cat, corpo in zip(partes[1::2], partes[2::2]):
        corpo = corpo.split("\n  ],")[0].split("\n  ]")[0]
        itens = []
        for nome, desc, preco in re.findall(r'nome:"([^"]+)", desc:"([^"]*)", preco:([\d.]+)', corpo):
            it = {"@type": "MenuItem", "name": nome, "url": f"{dominio}/prato/{slug(nome)}"}
            if desc: it["description"] = desc
            if float(preco) > 0: it["offers"] = {"@type": "Offer", "price": f"{float(preco):.2f}", "priceCurrency": "EUR"}
            itens.append(it)
        if itens: seccoes.append({"@type": "MenuSection", "name": cat, "hasMenuItem": itens})
    return {"@type": "Menu", "url": dominio + "/#menu", "inLanguage": "pt-PT", "hasMenuSection": seccoes}


m_ld = re.search(r'(<script type="application/ld\+json">\n)(.*?)(\n</script>)', html, re.S)
if m_ld:
    ld = json.loads(m_ld.group(2)); ld["hasMenu"] = menu_ld()
    html = html[:m_ld.start(2)] + json.dumps(ld, ensure_ascii=False) + html[m_ld.end(2):]
    (RAIZ / "index.html").write_text(html, encoding="utf8")
else:
    avisos.append("não encontrei o bloco JSON-LD no index.html (o Google não vai ver o menu).")

# ---------- 3. versão nos ficheiros ----------
FICH = ["css/estilo.css", "js/idiomas.js", "js/traducoes.js", "js/menu.js", "js/cafe.js"] + [f"js/{n}.js" for n in UI]
base_html = re.sub(r'<meta name="versao" content="[0-9a-f]{8}">', '<meta name="versao" content="00000000">', re.sub(r"\?v=[0-9a-f]{8}", "", html))
h = hashlib.sha1()
for f in FICH:
    h.update(ler(*f.split("/")).encode("utf8"))
h.update(base_html.encode("utf8"))
versao = h.hexdigest()[:8]
novo = re.sub(r'((?:/css/estilo\.css|/js/(?:idiomas|menu|cafe|ui-base|ui-menu|ui-pedido|ui-pesquisa|ui-topo)\.js))(?:\?v=[0-9a-f]{8})?"', lambda m: f'{m.group(1)}?v={versao}"', base_html)
novo = re.sub(r'(<meta name="versao" content=")[0-9a-f]{8}(")', lambda m: m.group(1) + versao + m.group(2), novo)
if novo != html:
    (RAIZ / "index.html").write_text(novo, encoding="utf8")
sw = ler("sw.js")
sw2 = re.sub(r'const VERSAO = "[^"]*";', f'const VERSAO = "cafe-principe-{versao}";', sw)
if sw2 != sw:
    (RAIZ / "sw.js").write_text(sw2, encoding="utf8")
print(f"Versão dos ficheiros: {versao}")

# ---------- resultado ----------
for a in avisos: print("AVISO:", a)
for e in erros: print("ERRO:", e)
print("Tudo certo." if not erros and not avisos else f"{len(erros)} erro(s), {len(avisos)} aviso(s).")
sys.exit(1 if erros else 0)

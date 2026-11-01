#!/usr/bin/env python3
"""Café Príncipe: prepara as fotos dos pratos.

Uso (na pasta do projeto):
    python scripts/otimizar-imagens.py "C:\\caminho\\foto.jpg" "Nome do prato"
    python scripts/otimizar-imagens.py foto1.jpg "Prego no Prato"  foto2.jpg "Tosta Mista"     (várias de uma vez)
    python scripts/otimizar-imagens.py foto.jpg "Nome do prato" --topo     (também cria a versão grande do topo da página)

O que faz com cada foto:
  - corrige a rotação dos telemóveis e REMOVE os dados escondidos (como a localização GPS de onde foi tirada);
  - img/<nome>.webp      foto do prato, 800x600, leve (normalmente 40-90 KB)
  - img/og/<nome>.jpg    imagem de partilha (WhatsApp, Facebook), 1200x630
  - com --topo: img/hero-<nome>.webp, 1800x1200
No fim diz que linha acrescentar em js/menu.js. Precisa de Pillow:  pip install pillow"""
import re, sys, unicodedata
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Falta o Pillow. Corre primeiro:  pip install pillow")

RAIZ = Path(__file__).resolve().parent.parent


def slug(t):
    t = "".join(c for c in unicodedata.normalize("NFD", t) if not unicodedata.combining(c)).lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")


def camel(s):
    p = s.split("-")
    return p[0] + "".join(x.capitalize() for x in p[1:])


def guardar(im, tamanho, destino, formato, qualidade):
    saida = ImageOps.fit(im, tamanho, Image.LANCZOS, centering=(0.5, 0.5))   # corta ao centro, sem deformar
    destino.parent.mkdir(parents=True, exist_ok=True)
    if formato == "JPEG":
        saida.save(destino, "JPEG", quality=qualidade, optimize=True, progressive=True)
    else:
        saida.save(destino, "WEBP", quality=qualidade, method=6)
    return destino.stat().st_size // 1024


def main(args):
    topo = "--topo" in args
    args = [a for a in args if a != "--topo"]
    if not args or len(args) % 2:
        sys.exit(__doc__)
    for ficheiro, nome in zip(args[::2], args[1::2]):
        f = Path(ficheiro)
        if not f.exists():
            print(f"ERRO: não encontro {f}"); continue
        s = slug(nome)
        im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")   # roda como o telemóvel queria; guardar de novo apaga o EXIF
        if min(im.size) < 600:
            print(f"AVISO: {f.name} é pequena ({im.size[0]}x{im.size[1]}); vai ficar com pouca qualidade.")
        kb1 = guardar(im, (800, 600), RAIZ / "img" / f"{s}.webp", "WEBP", 80)
        kb2 = guardar(im, (1200, 630), RAIZ / "img" / "og" / f"{s}.jpg", "JPEG", 82)
        print(f'OK "{nome}": img/{s}.webp ({kb1} KB) e img/og/{s}.jpg ({kb2} KB)')
        if topo:
            kb3 = guardar(im, (1800, 1200), RAIZ / "img" / f"hero-{s}.webp", "WEBP", 78)
            print(f"   topo: img/hero-{s}.webp ({kb3} KB)")
        print(f'   -> em js/menu.js, na lista FOTOS junta:  {camel(s)}: RAIZ + "img/{s}.webp",')
        print(f'   -> e no prato:  ...foto:FOTOS.{camel(s)}')
    print("Depois corre:  python scripts/gerar-dados.py")


main(sys.argv[1:])

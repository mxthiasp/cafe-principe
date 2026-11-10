---
name: Café Príncipe
description: Francesinhas e snack-bar em Brito, Guimarães, com a energia visual de uma cadeia de fast food.
colors:
  carvao: "#0D0D0D"
  carvao-2: "#181818"
  carvao-3: "#2A2A28"
  lima: "#B0BF3F"
  lima-viva: "#C4D452"
  oliva: "#7E8C4A"
  creme: "#F4F3EA"
  creme-2: "#A9AA9B"
typography:
  display:
    fontFamily: "Anton, Impact, Haettenschweiler, Arial Narrow Bold, sans-serif"
    fontSize: "clamp(2.7rem, 8vw, 5.6rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Anton, Impact, Haettenschweiler, Arial Narrow Bold, sans-serif"
    fontSize: "clamp(2.1rem, 5.2vw, 3.3rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "0.01em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.03em"
  price:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "1.9rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.01em"
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 700
    letterSpacing: "0.06em"
  body:
    fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  bandeira: "2px"
  pequeno: "6px"
  menu: "12px"
  raio: "14px"
  pilula: "999px"
spacing:
  card: "0.8rem"
  grelha: "1.4rem"
  secao: "clamp(3rem, 7vw, 5rem)"
  contentor: "min(1120px, 92%)"
components:
  button-primary:
    backgroundColor: "{colors.lima}"
    textColor: "{colors.carvao}"
    typography: "{typography.label}"
    rounded: "{rounded.pilula}"
    padding: "0.7rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.lima-viva}"
    textColor: "{colors.carvao}"
  button-xl:
    backgroundColor: "{colors.lima}"
    textColor: "{colors.carvao}"
    rounded: "{rounded.pilula}"
    padding: "0.9rem 2.4rem"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.creme}"
    rounded: "{rounded.pilula}"
    padding: "0.4rem 1rem"
  tab:
    backgroundColor: "{colors.carvao-2}"
    textColor: "{colors.creme}"
    typography: "{typography.label}"
    rounded: "{rounded.pilula}"
    padding: "0.5rem 1.3rem"
  tab-selected:
    backgroundColor: "{colors.lima}"
    textColor: "{colors.carvao}"
  card:
    backgroundColor: "{colors.carvao-2}"
    textColor: "{colors.creme}"
    rounded: "{rounded.raio}"
    padding: "{spacing.card}"
  chip:
    backgroundColor: "{colors.carvao-2}"
    textColor: "{colors.creme}"
    rounded: "{rounded.pilula}"
    padding: "0.35rem 0.9rem"
  card-price:
    textColor: "{colors.lima}"
    typography: "{typography.price}"
  price-chip:
    backgroundColor: "rgba(13,13,13,.78)"
    textColor: "{colors.creme}"
    typography: "{typography.price}"
    rounded: "{rounded.pilula}"
    padding: "0.4rem 0.9rem 0.32rem"
  input-search:
    backgroundColor: "{colors.carvao-2}"
    textColor: "{colors.creme}"
    rounded: "{rounded.pilula}"
    padding: "0.85rem 3rem"
---

# Design System: Café Príncipe

## Overview

**Creative North Star: "O Cartaz de Balcão"**

O site lê-se como os painéis de menu por cima do balcão de uma cadeia de fast food: fundo carvão, títulos gordos e condensados em maiúsculas, fotos de comida grandes e um único verde-lima que grita o que importa — o preço, o botão de ligar, o separador ativo. Não é um restaurante de toalha: é rápido, direto e com apetite.

A densidade é de cartaz, não de revista. Cada secção tem um título grande sublinhado pelo traço verde do logótipo, uma grelha de cartões-foto e uma ação clara. O movimento é curto e com mola (entradas de 0,4 s, um salto de 2–4 px ao passar o rato, a faixa lima a correr) e desliga-se todo com `prefers-reduced-motion` ou com o botão de pausa.

Os componentes são gordos e diretos: pílulas lima sólidas com texto condensado em maiúsculas, como num quiosque de pedidos. Tudo o que se pode tocar parece um botão.

**Key Characteristics:**
- Fundo carvão quase preto em todo o site; não há tema claro (só a impressão do menu é em branco).
- Um único acento, o verde-lima, reservado para ações, preços e estados ativos.
- Títulos em Anton, maiúsculas, com o traço verde do logótipo por baixo.
- Etiquetas, botões, preços e nomes de pratos em Barlow Condensed 700, maiúsculas, com espaçamento entre letras.
- Fotos de comida em grande, com gradiente escuro por baixo do texto.
- Formas em pílula para tudo o que é ação; cartões com cantos de 14px.

## Colors

Uma paleta de balcão à noite: carvão em três tons, creme quente para texto e um verde-lima ácido que é a voz da marca.

### Primary
- **Lima Príncipe** (`lima`): cor do logótipo. Botões principais, separador ativo, o símbolo € nos preços, contorno de foco, a faixa que corre, o traço sob os títulos, os pequenos rótulos acima dos títulos (`eyebrow`) e os realces de estado ("aberto", o dia de hoje no horário). Em transparência (15–25 %) faz fundos de etiquetas e halos.
- **Lima Viva** (`lima-viva`): só para o hover do botão principal.

### Secondary
- **Oliva de Grelha** (`oliva`): detalhe discreto. Borda dos cartões ao passar o rato e brilhos radiais por trás do topo sem foto.

### Neutral
- **Carvão** (`carvao`): fundo de toda a página, barras fixas e texto sobre lima.
- **Carvão de Cartão** (`carvao-2`): cartões, separadores em repouso, campo de pesquisa, janelas e menus suspensos.
- **Carvão de Borda** (`carvao-3`): bordas de 1–2px, divisores e hover de listas.
- **Creme** (`creme`): texto principal e títulos.
- **Creme Apagado** (`creme-2`): descrições de pratos, notas, rodapé, migalhas e placeholders.

### Named Rules
**A Regra do Verde que Vende.** O lima marca ações, estados ativos e os preços nos cartões. Exceções já em uso: o traço do logótipo, a faixa, os rótulos `eyebrow` e o subtítulo "Ingredientes" na página do prato. Não alargar o lima a mais texto que não se clica.

**A Regra do Texto Escuro no Lima.** Sobre lima o texto é sempre carvão, nunca creme ou branco.

## Typography

**Display Font:** Anton (com Impact, Haettenschweiler, Arial Narrow Bold)
**Body Font:** Barlow (com system-ui, Segoe UI)
**Label/Mono Font:** Barlow Condensed 600/700 (com Arial Narrow, Roboto Condensed)

**Character:** Anton é o cartaz: uma só espessura, grossa, condensada e sempre em maiúsculas. Barlow Condensed é a voz do balcão (botões, preços, nomes de pratos) e Barlow normal mantém as descrições legíveis.

### Hierarchy
- **Display** (Anton 400, clamp(2.7rem, 8vw, 5.6rem), 1): título do topo e o nome do prato na página de cada prato (clamp(2.2rem, 6vw, 3.6rem)).
- **Headline** (Anton 400, clamp(2.1rem, 5.2vw, 3.3rem), 1.02): título de cada secção, sempre com o traço verde por baixo.
- **Title** (Barlow Condensed 700, 1.4rem, 1.1, maiúsculas): nome do prato nos cartões (1.9rem nos cartões em destaque) e subtítulos.
- **Price** (Barlow Condensed 700, lima, números tabulares): nos cartões fica logo por baixo do nome, a 1.9rem no computador e 1.55rem no telemóvel, com os cêntimos e o € a meia altura. Na foto da página do prato e no topo continua dentro do chip de preço, em creme.
- **Label** (Barlow Condensed 600–700, 1.05–1.15rem, 0.05–0.06em, maiúsculas): botões, separadores, links do topo, navegação entre pratos.
- **Body** (Barlow 400, 1.0625rem, 1.5): descrições com 34–48ch; nos cartões desce para 0.92rem em creme apagado.

### Named Rules
**A Regra das Maiúsculas.** Tudo o que é Anton ou Barlow Condensed vai em maiúsculas. O texto corrido em Barlow nunca vai.

## Layout

Contentor único de `min(1120px, 92%)` centrado. Cada secção tem `clamp(3rem, 7vw, 5rem)` de espaço vertical. Os pratos vivem numa grelha automática de colunas com pelo menos 250px e 1.4rem de intervalo; os "mais pedidos" e os relacionados usam a mesma lógica com 220–260px.

O topo ocupa até 80 vh com a foto do prato à direita e o texto à esquerda, sobre um gradiente carvão da esquerda para a direita. A barra de separadores do menu fica colada por baixo do cabeçalho fixo.

Há dois pontos de corte: **820px** (telemóvel: os links do topo desaparecem, a foto do topo ocupa o ecrã inteiro com o texto por cima e as grelhas passam a uma coluna) e **1260px** (os links do topo escondem-se, fica só o botão de ligar). As setas dos separadores só aparecem com rato e mais de 821px.

## Elevation & Depth

Sistema escuro e quase plano: a profundidade vem dos tons de carvão (página → cartão → borda) e de sombras pretas difusas, não de luz.

### Shadow Vocabulary
- **Cartão em repouso** (`box-shadow: 0 6px 18px -10px rgba(0,0,0,.8)`): todos os cartões de prato.
- **Cartão levantado** (`box-shadow: 0 16px 30px -14px rgba(0,0,0,.9)`): hover do cartão, com `translateY(-4px)`.
- **Menu suspenso** (`box-shadow: 0 16px 36px -12px rgba(0,0,0,.9)`): lista de idiomas.
- **Brilho lima** (`box-shadow: 0 10px 30px -8px #B0BF3F`): só no botão XL do topo, com o pulso animado.

### Named Rules
**A Regra do Brilho Único.** A sombra lima só existe no botão principal do topo. Os outros elementos usam sombras pretas.

## Shapes

Duas famílias de forma: **pílula** (999px) para tudo o que é ação ou filtro — botões, separadores, etiquetas, chips, pesquisa, seletor de idioma — e **cartão** com cantos de 14px para fotos, cartões, a caixa do prato do dia e as janelas. Botões só com ícone (setas, pausa, fechar, redes) são círculos de 40–44px. A forma assinatura é o traço verde do logótipo, um pincel irregular usado sob os títulos, como marca de água no topo e como marca nas fotos que faltam.

## Components

### Buttons
Gordos e diretos, como as teclas de um quiosque de pedidos.
- **Shape:** pílula (999px).
- **Primary:** lima com texto carvão, Barlow Condensed 700 em maiúsculas, `0.7rem 1.5rem`.
- **Hover / Focus:** passa a lima viva, sobe 2px e um reflexo branco atravessa o botão em 0.75s. Ao carregar encolhe para 0.97. O foco é um contorno lima de 3px afastado 3px.
- **XL (topo):** 1.6rem, `0.9rem 2.4rem`, brilho lima e um pulso a cada 3s.
- **Secondary:** fundo transparente, borda de 1.5px em carvão de borda, texto creme; no hover a borda e o texto passam a lima.

### Chips
- **Style:** carvão de cartão, borda de 1px, pílula, `0.35rem 0.9rem`. Usados para ingredientes e alergénios.
- **Etiqueta:** variante pequena (0.8rem, 700) com fundo lima a 15% e texto lima.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** carvão de cartão, com borda de 1px em carvão de borda.
- **Shadow Strategy:** cartão em repouso → cartão levantado no hover (ver Elevation).
- **Border:** passa a oliva no hover. A foto dentro do cartão aumenta para 1.07.
- **Internal Padding:** 0.8rem. Ordem fixa: foto, nome, preço em lima, descrição. No computador a foto 4:3 fica em cima; no telemóvel fica sempre à esquerda (50 %), também nos pratos sem foto, para o preço ficar no mesmo sítio em todos os cartões.

### Preço nos cartões
O preço é a segunda coisa que se lê, logo por baixo do nome: lima, Barlow Condensed 700, nunca em cima da foto. "Preço a confirmar" ocupa o mesmo lugar em Barlow 600 creme apagado.

**A Regra do Preço Fixo.** Em todos os cartões o preço fica no mesmo sítio: por baixo do nome, na mesma coluna. Não alternar a foto de lado nem mudar a ordem nome → preço → descrição.

### Chip de preço
Pílula carvão translúcida (78 %) com desfoque, borda creme a 22 % e o preço em Barlow Condensed 700 creme, pousada no canto inferior da foto. Usa-se só na foto da página do prato e no topo, não nos cartões.

### Inputs / Fields
- **Style:** pesquisa em pílula, carvão de cartão, borda de 1.5px, ícone à esquerda e botão circular de limpar à direita.
- **Focus:** a borda passa a lima, sem contorno extra.

### Navigation
Cabeçalho fixo, translúcido com desfoque, com o logótipo à esquerda, links em Barlow Condensed 600 maiúsculas (lima no hover) e à direita o idioma e o botão "Ligar" em pílula lima. Ao fazer scroll fica compacto. Em telemóvel os links desaparecem e o botão de ligar fica só com o ícone, sempre no cabeçalho fixo; não há barra no fundo do ecrã.

### Separadores do menu
Pílulas deslizantes numa barra fixa: em repouso carvão de cartão com borda de 2px; no hover a borda passa a lima; o ativo é lima sólido com texto carvão. As pontas esbatem para carvão e com rato aparecem setas.

### Cartão em destaque ("Mais pedidos")
Assinatura do cartaz: a foto ocupa o cartão inteiro em 4:3, com gradiente preto por baixo e o nome do prato (1.9rem) e o preço em cima da foto, sem borda.

### Faixa
Fita lima de largura total com texto carvão em Barlow Condensed maiúsculas (letras espaçadas a 0.12em), separado por pontos, a correr em loop de 40s. Para quando se passa o rato.

## Do's and Don'ts

### Do:
- **Do** usar o lima `#B0BF3F` em ações, estados ativos e preços dos cartões; quando é fundo, o texto por cima é carvão.
- **Do** pôr o preço dos cartões logo por baixo do nome, no mesmo sítio em todos os cartões.
- **Do** pôr os títulos de secção em Anton maiúsculas com o traço verde por baixo.
- **Do** usar pílula (999px) para tudo o que se clica e 14px para cartões e fotos.
- **Do** mostrar a comida em foto grande, com gradiente carvão sob o texto.
- **Do** garantir que cada animação nova respeita `prefers-reduced-motion` e o botão de pausa.
- **Do** manter o contorno de foco lima de 3px em todos os elementos interativos.

### Don't:
- **Don't** introduzir um segundo acento de cor (vermelho, amarelo, azul): a cadeia de fast food aqui é verde-lima.
- **Don't** usar fundos claros nas secções do site; o branco é só para a impressão do menu.
- **Don't** usar Anton em texto corrido nem Barlow normal em botões.
- **Don't** pôr texto creme ou branco sobre lima.
- **Don't** usar cantos retos em botões ou separadores.

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
    fontSize: "clamp(2.7rem, 5.4vw, 4.4rem)"
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
  botao: "4px"
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
    rounded: "{rounded.botao}"
    padding: "0.7rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.lima-viva}"
    textColor: "{colors.carvao}"
  button-xl:
    backgroundColor: "{colors.lima}"
    textColor: "{colors.carvao}"
    rounded: "{rounded.botao}"
    padding: "0.9rem 2.4rem"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.creme}"
    rounded: "{rounded.botao}"
    padding: "0.4rem 1rem"
  tab:
    backgroundColor: "{colors.carvao-2}"
    textColor: "{colors.creme}"
    typography: "{typography.label}"
    rounded: "{rounded.botao}"
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
    rounded: "{rounded.botao}"
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
    rounded: "{rounded.botao}"
    padding: "0.85rem 3rem"
---

# Design System: Café Príncipe

## Overview

**Creative North Star: "O Cartaz de Balcão"**

O site lê-se como os painéis de menu por cima do balcão de uma cadeia de fast food: fundo carvão, títulos gordos e condensados em maiúsculas, fotos de comida grandes e um único verde-lima que grita o que importa — o preço, o botão de ligar, o separador ativo. Não é um restaurante de toalha: é rápido, direto e com apetite.

A densidade é de cartaz, não de revista. Cada secção tem um título grande sublinhado pelo traço verde do logótipo, uma grelha de cartões-foto e uma ação clara. O movimento é curto e com mola (entradas de 0,4 s, um salto de 2–4 px ao passar o rato, a faixa lima a correr) e desliga-se todo com `prefers-reduced-motion`. As palavras do título sobem de baixo, cortadas só por baixo, para os acentos e cedilhas nunca ficarem cortados.

Os componentes são gordos e diretos: blocos lima sólidos com cantos quase retos (4px) e texto condensado em maiúsculas, como as teclas de um quiosque de pedidos. Sem brilhos nem pulsar. Tudo o que se pode tocar parece um botão.

**Key Characteristics:**
- Fundo carvão quase preto em todo o site; não há tema claro (só a impressão do menu é em branco).
- Um único acento, o verde-lima, reservado para ações, preços e estados ativos.
- Títulos em Anton, maiúsculas, com o traço verde do logótipo por baixo.
- Etiquetas, botões, preços e nomes de pratos em Barlow Condensed 700, maiúsculas, com espaçamento entre letras.
- Fotos de comida em grande, com gradiente escuro por baixo do texto.
- Cantos de 4px em tudo o que é ação (botões, separadores, chips, pesquisa); cartões e fotos com 14px.

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
- **Display** (Anton 400, clamp(2.7rem, 5.4vw, 4.4rem) no computador; 2.5rem no telemóvel, 2.1rem em ecrãs baixos; 1): título do topo e o nome do prato na página de cada prato (clamp(2.2rem, 6vw, 3.6rem)).
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

### Named Rules
**A Regra Sem Brilho.** Não há sombras lima, pulsos nem reflexos em botões; a profundidade usa só sombras pretas.

## Shapes

Duas famílias de forma: **cantos quase retos** (4px) para tudo o que é ação ou filtro — botões, separadores, chips, pesquisa, seletor de idioma, botão do vídeo — e **cartão** com cantos de 14px para fotos, cartões, a caixa do prato do dia e as janelas. Botões só com ícone (setas, pausa, fechar, redes) são círculos de 40–44px. A forma assinatura é o traço verde do logótipo, um pincel irregular usado sob os títulos, como marca de água no topo e como marca nas fotos que faltam.

## Components

### Buttons
Gordos e diretos, como as teclas de um quiosque de pedidos.
- **Shape:** cantos de 4px.
- **Primary:** lima com texto carvão, Barlow Condensed 700 em maiúsculas, `0.7rem 1.5rem`.
- **Hover / Focus:** passa a lima viva e sobe 2px; sem reflexo nem brilho. Ao carregar encolhe para 0.97. O foco do teclado é um contorno creme de 3px afastado 3px, com um anel carvão por fora (igual nos botões, separadores, botão de ligar e botão do vídeo).
- **XL (topo):** 1.6rem, `0.9rem 2.4rem`, sem sombra nem pulso.
- **Secondary:** fundo transparente, borda de 1.5px em carvão de borda, texto creme; no hover a borda e o texto passam a lima.

### Chips
- **Style:** carvão de cartão, borda de 1px, cantos de 4px, `0.35rem 0.9rem`. Usados para ingredientes e alergénios.
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
- **Style:** pesquisa com cantos de 4px, carvão de cartão, borda de 1.5px, ícone à esquerda e botão circular de limpar à direita.
- **Focus:** a borda passa a lima, sem contorno extra.

### Pesquisa sem resultados
Caixa carvão de cartão (14px) com "Sem resultados para “…”" em Barlow Condensed 700 maiúsculas, a frase "Não encontras o que procuras? Liga-nos." e duas saídas: botão lima "Ligar" com o número e botão secundário "Ver o menu todo", que limpa a pesquisa e volta aos separadores.

### Menu no telemóvel
Pesquisa e separadores logo por baixo do título; "Partilhar menu" e "Menu em PDF" passam para o fim do menu. Separadores mais compactos (1rem, 44px de altura) para se verem três de cada vez.

### Navigation
Cabeçalho fixo, translúcido com desfoque, com o logótipo à esquerda, links em Barlow Condensed 600 maiúsculas (lima no hover) e à direita o idioma e o botão "Ligar" lima. Ao fazer scroll fica compacto. Em telemóvel os links desaparecem e o botão de ligar fica só com o ícone, sempre no cabeçalho fixo; não há barra no fundo do ecrã (desligada de propósito).

### Primeiro ecrã no telemóvel
Por baixo do nome do prato e de "Ver menu →": o estado ("Aberto agora, fecha às…") em Barlow Condensed 700 maiúsculas, lima quando está aberto e creme quando está fechado; depois um botão lima de largura total "Ligar para encomendar" com o ícone do telefone (54px de altura, 50px em ecrãs baixos); por fim a linha centrada "Só para levantar no café · sem entregas". No computador estes três ficam escondidos, porque o topo já mostra o estado em pílula e a nota de encomendas.

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
- **Do** usar cantos de 4px em tudo o que se clica e 14px para cartões e fotos; a pílula fica só para o chip de preço e as etiquetas.
- **Do** mostrar a comida em foto grande, com gradiente carvão sob o texto.
- **Do** garantir que cada animação nova respeita `prefers-reduced-motion`.
- **Do** manter o contorno de foco lima de 3px em todos os elementos interativos.

### Don't:
- **Don't** introduzir um segundo acento de cor (vermelho, amarelo, azul): a cadeia de fast food aqui é verde-lima.
- **Don't** usar fundos claros nas secções do site; o branco é só para a impressão do menu.
- **Don't** usar Anton em texto corrido nem Barlow normal em botões.
- **Don't** pôr texto creme ou branco sobre lima.
- **Don't** usar pílulas (999px) em botões ou separadores, nem sombras lima.

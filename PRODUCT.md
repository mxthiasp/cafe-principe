# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Sobretudo clientes da zona de Brito e Guimarães que já conhecem o café. Abrem o site no telemóvel para ver o menu e os preços e depois ligam a encomendar para levantar. Visitantes que procuram francesinhas na zona e quem fala inglês, francês, alemão ou espanhol são um público secundário (o site tem estas quatro línguas além do português).

## Product Purpose

O site do Café Príncipe mostra o menu com preços, fotos e alergénios, o horário, a morada e o telefone, para que o cliente decida o que quer e ligue a encomendar ou a reservar mesa. O site é bem-sucedido quando o cliente encontra o prato e o preço depressa e carrega em "Ligar".

## Positioning

Francesinha boa a preço de café, pronta depressa para levantar.

## Operating Context

- As encomendas fazem-se só por telefone, para levantar no café. Não há entregas nem pagamentos online.
- As mesas reservam-se por telefone (dia, hora e número de pessoas).
- O cliente usa o site sobretudo no telemóvel, muitas vezes com pressa e com fome. O botão de ligar fica sempre no cabeçalho fixo e, no telemóvel, há também um botão grande "Ligar para encomendar" no primeiro ecrã, com o estado (aberto/fechado) e a indicação "só para levantar". A barra "Ligar" fixa no fundo do ecrã foi desligada de propósito e não deve voltar.
- Cada prato tem página própria (`/prato/<nome>`), com pré-visualização para partilhar, e o menu pode ser impresso ou guardado em PDF.
- O site funciona sem rede depois da primeira visita.

## Capabilities and Constraints

- Quem mantém o site é o dono, editando os ficheiros diretamente: preços e pratos em `js/menu.js`, contactos, horário, aviso e prato do dia em `js/cafe.js`, traduções em `js/traducoes.js`. Tudo tem de continuar editável sem instalar nada: HTML, CSS e JavaScript simples, sem framework nem passo de compilação.
- Antes de cada commit corre-se `python scripts/gerar-dados.py`, que valida o menu e as traduções e atualiza o sitemap e as versões.
- O site é publicado na Cloudflare a cada commit no `main`. Há um Worker só para as páginas de prato.
- Há cinco línguas: português, inglês, francês, alemão e espanhol. Cada texto novo precisa das quatro traduções.
- A CSP em `_headers` é restrita: serviços ou scripts externos novos têm de ser autorizados lá.
- As estatísticas de visitas são sem cookies (Cloudflare Web Analytics).
- O tempo de preparação varia muito e não se publica.
- Ainda por decidir ou fornecer: os preços de asinhas de frango, rissóis de carne e bolinhos de bacalhau; as marcas para os alergénios e o aviso de vestígios; as contas de Instagram e Facebook (ainda não existem). O nome legal e o NIF do titular já estão em `js/cafe.js` (`CAFE.legal`) e aparecem no rodapé.

## Brand Commitments

- O nome é Café Príncipe, em Brito, Guimarães.
- O logótipo inclui o traço verde que o site usa como marca.
- O molho das francesinhas é caseiro, feito na casa.
- O tom é direto e próximo, tratando o cliente por "tu" ("Com fome? Encomenda por telefone e levanta no café.").

## Evidence on Hand

- Fotos reais dos pratos em `img/` (WebP), da fachada e a imagem de partilha `og-image.jpg`.
- O menu, os preços, o horário e a morada reais estão em `js/menu.js` e `js/cafe.js`.
- Há uma secção de avaliações de clientes; só pode mostrar avaliações reais e escondê-la quando não as houver.
- Não inventar preços, alergénios, avaliações, redes sociais, tempos de preparação nem dados legais que o dono não tenha dado.

## Product Principles

1. **Do menu ao telefone o mais depressa possível.** Cada ecrã deve levar ao prato, ao preço e ao botão "Ligar".
2. **Só informação verdadeira.** Preços, alergénios e avaliações vêm do dono; quando faltam, diz-se que faltam.
3. **Fácil de manter por quem não é programador.** Nenhuma melhoria pode obrigar a instalar ferramentas ou mexer em código difícil.
4. **O telemóvel primeiro.** O cliente típico está no telemóvel, com pressa e às vezes com rede fraca.

## Accessibility & Inclusion

- Todo o movimento respeita `prefers-reduced-motion`. O vídeo do molho tem botão próprio para pausar; o botão de pausa do topo está escondido.
- O site tem um link "Saltar para o menu", contornos de foco visíveis e navegação por teclado nos separadores e menus.
- Cada texto tem de existir nas cinco línguas.

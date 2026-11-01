# Café Príncipe

Site do Café Príncipe (Brito, Guimarães). HTML, CSS e JavaScript simples, sem instalar nada.
Publica-se sozinho na Cloudflare sempre que há um commit no ramo `main`.

## Onde mudar cada coisa

| Quero mudar... | Ficheiro |
|---|---|
| um preço, o nome ou a descrição de um prato, as fotos dos pratos | `js/menu.js` |
| o telefone, a morada, o horário, os feriados, o "sobre nós", as perguntas frequentes, a foto da fachada | `js/cafe.js` |
| a tradução de um prato ou de um texto (inglês, francês, alemão, espanhol) | `js/traducoes.js` (só é descarregado quando alguém escolhe outra língua; a lista de línguas e as bandeiras estão em `js/idiomas.js`) |
| as cores, os tamanhos, o aspeto no telemóvel | `css/estilo.css` |
| a estrutura da página (secções, textos fixos em português) | `index.html` |
| a lógica do site (dividida por tema) | `js/ui-base.js` (idiomas), `ui-menu.js` (separadores, página de prato), `ui-pedido.js` ("O meu pedido"), `ui-pesquisa.js`, `ui-topo.js` (topo e privacidade). Normalmente não é preciso mexer |

### Faixa de aviso e prato do dia (em `js/cafe.js`)

- **Aviso no topo** (`CAFE.aviso`): põe `ativo: true`, escreve o `texto` e, se quiseres, a data `ate` ("2026-12-31"). O cliente pode fechá-lo. O texto pode ser uma frase em português ou um objeto com as várias línguas.
- **Prato do dia** (`CAFE.pratoDoDia`): põe `ativo: true` e em `prato` o nome EXATO de um prato do menu: o preço, a descrição e as traduções vêm de lá e o cartão abre o prato. Deixa `prato: ""` para escrever um texto livre. `ate` esconde-o sozinho depois dessa data.
- **O meu pedido**: lista que o cliente prepara no site para depois ligar. Não é uma encomenda nem recebe pagamentos. Fica guardada só no telemóvel dele.

Outras pastas: `img/` (fotos), `fonts/` (letras), `worker/` (pré-visualização de cada prato ao partilhar), `sw.js` (modo sem rede).

## Depois de mudar um prato ou um preço

**Antes de cada commit** corre `python scripts/gerar-dados.py`. Ele:
- atualiza a pré-visualização de partilha (`worker/pratos.json`) e o `sitemap.xml`;
- **verifica** o menu: pratos sem tradução, fotos que não existem, nomes repetidos, textos do site sem tradução (escreve ERRO ou AVISO);
- escreve um número de versão nos links do `index.html` (`?v=...`) e no `sw.js`, para os telemóveis nunca ficarem com ficheiros velhos.
Se mudares o **nome** de um prato, muda também a tradução em `js/traducoes.js` (procura `MENU_I18N`), senão as outras línguas ficam desatualizadas.

## Ver o site no computador antes de publicar

Os ficheiros usam caminhos como `/js/ui-base.js`, por isso não abrem com duplo clique. No VS Code, instala a extensão **Live Server** e clica em "Go Live".

## Segurança
O ficheiro `_headers` define os cabeçalhos de segurança (CSP, anti-clickjacking, etc.). Se um dia adicionares um script ou serviço externo (analytics, mapas), tens de o autorizar na linha `Content-Security-Policy` desse ficheiro. Se mexeres no pequeno script que está dentro do `index.html`, o `hash` do CSP muda e tem de ser atualizado.

## Fotos novas
Põe a foto original (do telemóvel) numa pasta qualquer e corre:
`python scripts/otimizar-imagens.py "C:\\caminho\\foto.jpg" "Nome do prato"`
Ele cria a foto leve (WebP) e a imagem de partilha, corrige a rotação e apaga a localização GPS escondida na foto. No fim diz-te a linha a acrescentar em `js/menu.js`. Precisa de `pip install pillow`.

## Verificação automática
O ficheiro `.github/workflows/verificar.yml` corre no GitHub a cada push (separador **Actions**). Se aparecer um ✗ vermelho, abre-o para ver o que falhou (tradução em falta, foto que não existe, esqueceste de correr `gerar-dados.py`). Não impede o site de ser publicado: serve de aviso.

## Página de erro
`404.html` é a página que aparece quando o endereço não existe. É independente do resto do site de propósito.

## Notas técnicas
- **Sem "saltos" ao carregar**: enquanto o topo não tem a altura certa e as letras não chegaram, o CSS esconde tudo menos o cabeçalho (`html.js:not(.pronto)`). O `ui-topo.js` junta a classe `pronto` quando está tudo preparado (máximo 0,8 s). Se um dia mudares o pequeno script do `index.html`, atualiza o `hash` no `_headers`.
- Os cabeçalhos `Strict-Transport-Security` e `Cross-Origin-Opener-Policy` estão no `_headers`.
- Para quem usa o telemóvel noutra língua (inglês, francês, alemão, espanhol), o `index.html` começa a descarregar as traduções logo no cabeçalho (`<meta name="versao">` é carimbado pelo `gerar-dados.py`).

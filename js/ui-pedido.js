/* ============================================================
   "O meu pedido", rotas das páginas de prato e dados do Google (js/ui-pedido.js)
   O funcionamento do site está dividido em ficheiros por tema (ui-base, ui-menu, ui-pedido, ui-pesquisa, ui-topo).
   Carregam por esta ordem e partilham as mesmas variáveis. Os dados estão em js/cafe.js, js/menu.js, js/idiomas.js e js/traducoes.js.
   ============================================================ */
/* ============ O MEU PEDIDO (lista para preparar a chamada; não é uma encomenda) ============ */
let PEDIDO = {};   // { "Nome do prato": quantidade }
try{ PEDIDO = JSON.parse(localStorage.getItem("pedido") || "{}") || {}; }catch(e){ PEDIDO = {}; }
/* só ficam pratos que ainda existem no menu */
Object.keys(PEDIDO).forEach(n => { if(!PRATOS.some(x => x.p.nome === n) || !(PEDIDO[n] > 0)) delete PEDIDO[n]; });
const qtdPedido = nome => PEDIDO[nome] || 0;
const totalItens = () => Object.values(PEDIDO).reduce((s, q) => s + q, 0);
function guardarPedido(){ try{ localStorage.setItem("pedido", JSON.stringify(PEDIDO)); }catch(e){} }
function botaoJuntar(p){
  const n = qtdPedido(p.nome), nome = nomePrato(p);
  return `<button type="button" class="juntar" data-juntar="${p.nome}" data-n="${n}" aria-label="${T("Juntar {nome} à lista").replace("{nome}", nome)}"><span class="mais" aria-hidden="true">${n > 0 ? "✓" : "+"}</span><span class="juntar-txt" aria-hidden="true">${n > 0 ? n : T("Juntar à lista")}</span></button>`;
}
function mudarPedido(nome, delta){
  const q = Math.max(0, qtdPedido(nome) + delta);
  if(q) PEDIDO[nome] = q; else delete PEDIDO[nome];
  guardarPedido(); montarPedido(true);
  const x = PRATOS.find(y => y.p.nome === nome);
  if(x) $("#pedidoLive").textContent = `${nomePrato(x.p)}: ${q}`;
}
function montarPedido(manter){
  const itens = Object.entries(PEDIDO).map(([n, q]) => ({x: PRATOS.find(y => y.p.nome === n), q})).filter(i => i.x);
  const total = totalItens(), btn = $("#pedidoBtn");
  btn.hidden = total === 0; $("#pedidoBtnN").textContent = total;
  btn.setAttribute("aria-label", `${T("O meu pedido")}: ${total}`);
  const dlg = $("#dlgPedido"); dlg.dataset.vazio = String(total === 0);
  $("#pedidoLista").innerHTML = itens.map(({x, q}) => `<li><span class="pedido-nome">${nomePrato(x.p)}</span>
    <span class="qtd"><button type="button" data-menos="${x.p.nome}" aria-label="${T("Tirar {nome} da lista").replace("{nome}", nomePrato(x.p))}">−</button><output aria-live="polite">${q}</output><button type="button" data-mais="${x.p.nome}" aria-label="${T("Juntar {nome} à lista").replace("{nome}", nomePrato(x.p))}">+</button></span></li>`).join("");
  $("#pedidoTotal").textContent = total ? T("O preço final é confirmado por telefone. Embalagens (sacos, tupperwares, caixas) e outros extras podem ter um custo adicional.") : "";
  /* atualiza os botões dos cartões e da página do prato sem os reconstruir */
  document.querySelectorAll(".juntar").forEach(b => { const n = qtdPedido(b.dataset.juntar); b.dataset.n = n; b.querySelector(".mais").textContent = n > 0 ? "✓" : "+"; b.querySelector(".juntar-txt").textContent = n > 0 ? n : T("Juntar à lista"); });
  const jp = $("#juntarPrato"); if(jp){ const n = qtdPedido(jp.dataset.juntar); jp.setAttribute("aria-pressed", String(n > 0)); jp.textContent = n > 0 ? `✓ ${T("Na lista")} (${n})` : `+ ${T("Juntar à lista")}`; }
  if(total === 0 && dlg.open && manter) dlg.dataset.vazio = "true";
}
document.addEventListener("click", e => {
  const j = e.target.closest("[data-juntar]"); if(j){ e.preventDefault(); e.stopPropagation(); mudarPedido(j.dataset.juntar, 1); return; }
  const m = e.target.closest("[data-mais]"); if(m){ mudarPedido(m.dataset.mais, 1); const b = document.querySelector(`[data-mais="${CSS.escape(m.dataset.mais)}"]`); if(b) b.focus(); return; }
  const l = e.target.closest("[data-menos]"); if(l){ mudarPedido(l.dataset.menos, -1); const b = document.querySelector(`[data-menos="${CSS.escape(l.dataset.menos)}"]`) || $("#fecharPedido"); b.focus(); return; }
}, true);
$("#pedidoBtn").addEventListener("click", () => { montarPedido(); $("#dlgPedido").showModal(); });
$("#fecharPedido").addEventListener("click", () => $("#dlgPedido").close());
$("#dlgPedido").addEventListener("click", e => { if(e.target === $("#dlgPedido")) $("#dlgPedido").close(); });
$("#pedidoLimpar").addEventListener("click", () => { PEDIDO = {}; guardarPedido(); montarPedido(); $("#dlgPedido").close(); });
$("#pedidoCopiar").addEventListener("click", async () => {
  /* o texto copiado fica em português (os nomes do menu do café) */
  const linhas = Object.entries(PEDIDO).map(([n, q]) => `${q}x ${n}`);
  const txt = "Olá, quero encomendar:\n" + linhas.join("\n");
  const b = $("#pedidoCopiar"), no = b.firstChild;
  try{ await navigator.clipboard.writeText(txt); }catch(e){ try{ const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }catch(_){} }
  no.nodeValue = T("Copiado!");
  setTimeout(() => { no.nodeValue = T("Copiar lista"); }, 1800);
});

/* ============ DADOS PARA O GOOGLE: horário gerado a partir do HORARIO ============ */
function atualizarJSONLD(){
  const el = document.querySelector('script[type="application/ld+json"]'); if(!el) return;
  try{
    const d = JSON.parse(el.textContent), nomes = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], spec = [];
    const fim = h => h === "24:00" ? "23:59" : h;
    Object.entries(HORARIO).forEach(([dia, ints]) => ints.forEach(([ab, fe]) => spec.push({"@type":"OpeningHoursSpecification", dayOfWeek: nomes[dia], opens: ab, closes: fim(fe)})));
    d.openingHoursSpecification = spec; el.textContent = JSON.stringify(d);
  }catch(e){}
}
let pratoAtual = null, scrollInicio = 0, vieDoSite = false;
const tituloBase = "Café Príncipe | Francesinhas em Brito, Guimarães";
function abrirPrato(nome){
  const x = PRATOS.find(y => y.p.nome === nome); if(!x) return; vieDoSite = true;
  if(ROTAS_LIMPAS){ history.pushState({}, "", "/prato/" + x.slug); rota(); } else location.hash = "#/prato/" + x.slug;
}
/* ir para uma secção do início (a partir da página de um prato) */
function navegarInicio(id){
  if(ROTAS_LIMPAS){ history.pushState({}, "", "/" + (id ? "#" + id : "")); rota(); } else location.hash = "#" + (id || "topo");
}
/* separa a descrição em ingredientes (para as "etiquetas") e notas como "Com batata" */
function analisarDesc(desc){
  const CONJ = {pt:" e ", en:" and ", fr:" et ", de:" und ", es:" y "}[LANG], EXTRA = /^(com |with |avec |mit |con |servi )/i;
  const frases = (desc || "").split(".").map(x => x.trim()).filter(Boolean);
  let lista = [], texto = ""; const extras = [];
  frases.forEach((f,i) => {
    if(i > 0 || EXTRA.test(f)){ extras.push(f); return; }
    const partes = f.split(", "), termos = [];
    partes.forEach((t,j) => { if(j === partes.length - 1 && t.includes(CONJ)) termos.push(...t.split(CONJ)); else termos.push(t); });
    if(termos.length >= 2) lista = termos; else texto = f;
  });
  const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  return {lista:lista.map(cap), texto, extras};
}
function montarPrato(){
  if(!pratoAtual) return;
  const {p, cat} = pratoAtual, nome = nomePrato(p), d = analisarDesc(descPrato(p));
  const lista = PRATOS.filter(x => x.cat === cat), i = lista.findIndex(x => x.p === p);
  const ant = lista[i - 1], seg = lista[i + 1];
  const rel = [...lista.filter(x => x.p !== p), ...PRATOS.filter(x => x.cat !== cat)].slice(0, 3);
  const foto = p.foto ? `<div class="prato-foto"><img src="${p.foto}" alt="${nome}" decoding="async">${chipPreco(p.preco)}</div>` : `<div class="prato-foto prato-foto--vazia">${chipPreco(p.preco)}</div>`;
  const factos = [[T("Categoria"), nomeCat(cat)], p.porcao && [T("Porção"), T(p.porcao)], p.alergenios && [T("Alergénios"), T(p.alergenios)]].filter(Boolean);
  const tel = TELEFONES.encomendas;
  $("#paginaPrato").innerHTML = `<div class="wrap">
    <nav class="migalhas" aria-label="${T("Menu")}"><a href="#menu">${T("Menu")}</a><span aria-hidden="true">›</span><button type="button" data-cat="${cat}">${nomeCat(cat)}</button><span aria-hidden="true">›</span><span aria-current="page">${nome}</span></nav>
    <div class="prato-grelha">
      ${foto}
      <div class="prato-info">
        <h1 id="pratoTitulo">${nome}</h1>
        ${p.destaque ? favorito() : ""}
        ${d.texto ? `<p class="prato-texto">${d.texto}.</p>` : ""}
        ${p.nota ? `<p class="prato-texto">${T(p.nota)}</p>` : ""}
        ${d.lista.length ? `<h2>${T("Ingredientes")}</h2><div class="chips">${d.lista.map(t => `<span class="chip">${t}</span>`).join("")}</div>` : ""}
        ${d.extras.map(t => `<span class="prato-extra">${t}.</span>`).join(" ")}
        <dl class="prato-factos">${factos.map(([k,v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>
        ${p.alergenios ? "" : `<p class="nota-alergenios">${T("Tens alguma alergia ou intolerância? Fala connosco antes de encomendar:")} <a href="tel:${tel.replace(/\s/g,"")}">${tel}</a></p>`}
        <div class="prato-acoes">
          <a class="btn btn--xl" href="tel:${tel.replace(/\s/g,"")}">${T("Ligar para encomendar")}</a>
          <button type="button" class="btn-sec" id="juntarPrato" data-juntar="${p.nome}" aria-pressed="${qtdPedido(p.nome) > 0}">${qtdPedido(p.nome) > 0 ? "✓ " + T("Na lista") + " (" + qtdPedido(p.nome) + ")" : "+ " + T("Juntar à lista")}</button>
          <button type="button" class="btn-sec" id="partilharPrato">${T("Partilhar este prato")}</button>
        </div>
      </div>
    </div>
    <div class="prato-nav">
      ${ant ? `<a href="${urlPrato(ant.p.nome)}" data-prato="${ant.p.nome}"><small>‹ ${T("Anterior")}</small>${nomePrato(ant.p)}</a>` : "<span></span>"}
      ${seg ? `<a href="${urlPrato(seg.p.nome)}" data-prato="${seg.p.nome}"><small>${T("Seguinte")} ›</small>${nomePrato(seg.p)}</a>` : ""}
    </div>
    <section class="relacionados"><h2>${T("Também podes gostar")}</h2><div class="relacionados-lista">${rel.map(x => `
      <a class="card" href="${urlPrato(x.p.nome)}" data-prato="${x.p.nome}">
        <div class="foto${x.p.foto ? "" : " foto--vazia"}">${x.p.foto ? `<img src="${x.p.foto}" alt="${nomePrato(x.p)}" loading="lazy" decoding="async">` : ""}${chipPreco(x.p.preco)}</div>
        <h3>${nomePrato(x.p)}</h3>
        <div class="card-fim"><span class="ver-mais" aria-hidden="true">${T("Ver detalhes")} ›</span></div>
      </a>`).join("")}</div></section>
  </div>`;
  document.title = nome + " · Café Príncipe";
  const md = document.querySelector('meta[name="description"]'); if(md) md.content = nome + ". " + descPrato(p);
}
/* o prato do dia (quando aponta para um prato do menu) abre a página do prato */
$("#inicio").addEventListener("click", e => { const pd = e.target.closest("a#pratoDia"); if(pd && cliqueSimples(e)){ e.preventDefault(); abrirPrato(pd.dataset.prato); } });
/* cliques dentro da página do prato */
$("#paginaPrato").addEventListener("click", e => {
  const pr = e.target.closest("[data-prato]"); if(pr){ if(cliqueSimples(e)){ e.preventDefault(); abrirPrato(pr.dataset.prato); } return; }
  const ct = e.target.closest(".migalhas button"); if(ct){ mostrarCategoria(ct.dataset.cat); navegarInicio("menu"); return; }
  if(e.target.closest("#partilharPrato")){
    const url = location.href, texto = T("Vê este prato do Café Príncipe") + ": " + nomePrato(pratoAtual.p);
    if(navigator.share){ navigator.share({title:"Café Príncipe", text:texto, url}).catch(() => {}); } else open("https://wa.me/?text=" + encodeURIComponent(texto + " " + url), "_blank", "noopener");
  }
});
/* deslizar para o lado passa ao prato anterior ou seguinte */
let t1 = null;
$("#paginaPrato").addEventListener("touchstart", e => { t1 = {x:e.touches[0].clientX, y:e.touches[0].clientY}; }, {passive:true});
$("#paginaPrato").addEventListener("touchend", e => {
  if(!t1 || !pratoAtual) return; const dx = e.changedTouches[0].clientX - t1.x, dy = e.changedTouches[0].clientY - t1.y; t1 = null;
  if(Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
  const lista = PRATOS.filter(x => x.cat === pratoAtual.cat), i = lista.findIndex(x => x.p === pratoAtual.p), v = lista[i + (dx < 0 ? 1 : -1)];
  if(v) abrirPrato(v.p.nome);
}, {passive:true});

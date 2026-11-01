/* ============================================================
   Topo com vários pratos, política de privacidade e seletor de idioma (js/ui-topo.js)
   O funcionamento do site está dividido em ficheiros por tema (ui-base, ui-menu, ui-pedido, ui-pesquisa, ui-topo).
   Carregam por esta ordem e partilham as mesmas variáveis. Os dados estão em js/cafe.js, js/menu.js, js/idiomas.js e js/traducoes.js.
   ============================================================ */
/* ============ TOPO COM VÁRIOS PRATOS ============ */
const heroBotao = $("#heroBotao"), heroTexto = $("#heroTexto"), heroExtra = $("#heroExtra");
const principal = {titulo:h1.getAttribute("aria-label"), texto:heroTexto.textContent, botao:heroBotao.textContent, foto:CAFE.fotoHero};
let topoAtualizar = () => { escreverTitulo(T(principal.titulo)); heroTexto.textContent = T(principal.texto); heroBotao.textContent = T(principal.botao); };
const outros = (CAFE.slides || []).map(sl => {
  for(const [cat, itens] of Object.entries(MENU)){
    const p = itens.find(x => x.nome === sl.prato);
    if(p) return {titulo:sl.frase || p.nome, frase:sl.frase, texto:p.desc, nomePrato:p.nome, preco:p.preco, botao:"Ver prato", cat, prato:p.nome, foto:sl.foto};
  }
  return null;
}).filter(Boolean);
const ecras = [principal, ...outros].filter(x => x.foto);
if(ecras.length >= 2){
  heroEl.classList.add("hero--slides");
  heroEl.setAttribute("aria-roledescription", "carrossel");
  const camada = document.createElement("div"); camada.className = "hero-slides";
  ecras.forEach((x,i) => { const d = document.createElement("div"); d.className = "hero-slide" + (i === 0 ? " ativo" : ""); camada.appendChild(d); x.el = d; });
  heroEl.insertBefore(camada, heroEl.firstChild);
  /* cada foto só é pedida quando está quase a aparecer */
  const carregar = i => { const x = ecras[(i + ecras.length) % ecras.length]; if(!x.el.style.backgroundImage) x.el.style.backgroundImage = `url("${x.foto}")`; };
  carregar(0); addEventListener("load", () => carregar(1));
  const pontos = document.createElement("div"); pontos.className = "hero-pontos"; pontos.setAttribute("role", "group"); pontos.setAttribute("aria-label", "Pratos em destaque");
  pontos.innerHTML = ecras.map((x,i) => `<button type="button" class="hp${i === 0 ? " ativo" : ""}" data-i="${i}" aria-label="${x.nomePrato || x.titulo}"><i></i></button>`).join("");
  heroEl.appendChild(pontos);
  let atual = 0;
  const trocarTexto = (x, animar = true) => {
    const tit = x.nomePrato && !x.frase ? nomePrato({nome:x.nomePrato}) : T(x.titulo);
    escreverTitulo(tit);
    if(x.nomePrato){ heroTexto.innerHTML = `<b class="hero-prato">${nomePrato({nome:x.nomePrato})}</b>${descPrato({nome:x.nomePrato, desc:x.texto})}`; } else { heroTexto.textContent = T(x.texto); }
    heroExtra.innerHTML = x.preco > 0 ? `<span class="hero-preco"><span class="sr-so">${euro(x.preco)}</span><span aria-hidden="true" class="pp">${precoPartes(x.preco)}</span></span>` : "";
    heroBotao.textContent = T(x.botao); heroBotao.dataset.cat = x.cat || ""; heroBotao.dataset.prato = x.prato || "";
    if(animar && !reduz) [heroTexto, heroExtra, heroBotao].forEach(el => el.animate([{opacity:0, transform:"translateY(14px)"}, {opacity:1, transform:"none"}], {duration:600, easing:"cubic-bezier(.2,.8,.2,1)"}));
  };
  topoAtualizar = () => {
    trocarTexto(ecras[atual], false);
    [...pontos.children].forEach((b,i) => b.setAttribute("aria-label", ecras[i].nomePrato ? nomePrato({nome:ecras[i].nomePrato}) : T(ecras[i].titulo)));
    pontos.setAttribute("aria-label", T("Pratos em destaque"));
  };
  /* o topo fica sempre com a altura do prato que ocupa mais espaço, para a página não "saltar" quando a foto e o texto mudam */
  const fixarAltura = () => {
    heroEl.style.minHeight = "";
    let maior = 0;
    ecras.forEach(x => { trocarTexto(x, false); maior = Math.max(maior, heroEl.offsetHeight); });
    trocarTexto(ecras[atual], false);
    heroEl.style.minHeight = maior + "px";
  };
  const topoAtualizarBase = topoAtualizar;
  topoAtualizar = () => { topoAtualizarBase(); fixarAltura(); };
  let larguraAntes = innerWidth, tAltura;
  addEventListener("resize", () => { if(innerWidth === larguraAntes) return; larguraAntes = innerWidth; clearTimeout(tAltura); tAltura = setTimeout(fixarAltura, 200); });
  addEventListener("load", fixarAltura);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(fixarAltura);
  fixarAltura();
  const ir = i => {
    i = (i + ecras.length) % ecras.length; if(i === atual) return;
    carregar(i); carregar(i + 1);
    ecras[atual].el.classList.remove("ativo"); pontos.children[atual].classList.remove("ativo");
    atual = i; ecras[i].el.classList.add("ativo"); pontos.children[i].classList.add("ativo");
    trocarTexto(ecras[i]);
  };
  pontos.addEventListener("click", e => { const b = e.target.closest(".hp"); if(b) ir(+b.dataset.i); });
  pontos.addEventListener("animationend", e => { if(e.target.parentElement.classList.contains("ativo")) ir(atual + 1); });   // a barra a encher marca o tempo de cada prato
  let t0 = null;
  heroEl.addEventListener("touchstart", e => { t0 = {x:e.touches[0].clientX, y:e.touches[0].clientY}; }, {passive:true});
  heroEl.addEventListener("touchend", e => {
    if(!t0) return; const dx = e.changedTouches[0].clientX - t0.x, dy = e.changedTouches[0].clientY - t0.y; t0 = null;
    if(Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) ir(atual + (dx < 0 ? 1 : -1));
  }, {passive:true});
  heroBotao.addEventListener("click", e => {
    if(!heroBotao.dataset.prato) return;
    e.preventDefault(); abrirPrato(heroBotao.dataset.prato);
  });
}
/* faixa de categorias a deslizar */
const montarFaixa = () => { $("#faixa").innerHTML = Object.keys(MENU).map(n => `<span>${nomeCat(n)}</span>`).join("").repeat(4); };
montarFaixa();
/* indicador de scroll (só em ecrãs grandes) */
heroEl.insertAdjacentHTML("beforeend", '<a class="rolar" href="#menu" aria-label="Ver o menu"><span></span></a>');
/* botão para pausar o movimento (faixa, carrossel e zoom da foto) */
heroEl.insertAdjacentHTML("beforeend", '<button type="button" class="pausa" id="pausarMov" aria-pressed="false" aria-label="Pausar movimento"><svg class="ic-pausa" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><svg class="ic-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></button>');
const atualizarPausa = () => { const b = $("#pausarMov"), pz = document.documentElement.classList.contains("pausado"); b.setAttribute("aria-pressed", String(pz)); b.setAttribute("aria-label", T(pz ? "Retomar movimento" : "Pausar movimento")); };
$("#pausarMov").onclick = () => { document.documentElement.classList.toggle("pausado"); atualizarPausa(); };
/* parallax suave da foto do topo */
if(!reduz){
  let ticking = false;
  addEventListener("scroll", () => {
    if(ticking) return; ticking = true;
    requestAnimationFrame(() => { heroEl.style.setProperty("--py", Math.min(scrollY * .16, 150) + "px"); ticking = false; });
  }, {passive:true});
}
/* traço verde dos títulos que se desenha, e blocos que entram em cascata */
document.querySelectorAll(".contactos, .rodape-grelha").forEach(g => { g.classList.add("stag"); [...g.children].forEach((c,i) => c.style.setProperty("--i", i)); });
if("IntersectionObserver" in window){
  const obs2 = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add("visto"); obs2.unobserve(e.target); } }), {threshold:.2});
  document.querySelectorAll("section h2, .stag").forEach(el => obs2.observe(el));
} else document.querySelectorAll("section h2, .stag").forEach(el => el.classList.add("visto"));

/* secções que aparecem suavemente ao descer */
const alvos = document.querySelectorAll("#salsa .wrap, #faq .wrap, #sobre .wrap, #avaliacoes .wrap, #reservas .wrap");
if("IntersectionObserver" in window){
  const obs = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add("visto"); obs.unobserve(e.target); } }), {threshold:.12});
  alvos.forEach(a => { a.classList.add("reveal"); obs.observe(a); });
}
const IC = {
  instagram:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
  facebook:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8V6.5c0-.7.3-1 1-1h2V2h-3c-3 0-4.5 1.8-4.5 4.5V8H7v3.5h2.5V22H14V11.5h2.8L17.3 8z"/></svg>'
};
$("#redes").innerHTML = Object.entries(CAFE.redes).filter(([,u]) => u).map(([n,u]) => `<a href="${u}" target="_blank" rel="noopener" aria-label="${n}">${IC[n]}</a>`).join("");
montarPratoDia(); montarAviso();
mostrarCategoria("Francesinhas");
$("#salsaFoto").innerHTML = `<img src="${FOTOS.especial}" alt="Francesinha com a nossa salsa" loading="lazy" decoding="async">`;
$("#ano").textContent = new Date().getFullYear();
/* estatísticas de visitas sem cookies (Cloudflare Web Analytics): só se houver token */
if(CAFE.analitica && CAFE.analitica.cloudflareToken){
  const sc = document.createElement("script"); sc.defer = true; sc.src = "https://static.cloudflareinsights.com/beacon.min.js";
  sc.setAttribute("data-cf-beacon", JSON.stringify({token: CAFE.analitica.cloudflareToken})); document.body.appendChild(sc);
  $("#notaAnalitica").hidden = false;
}

/* ============ POLÍTICA DE PRIVACIDADE ============ */
const PRIV = ["p1","p2","p3","p4","p5","p6","p7","p8"];
const PRIV_PT = {"t": "Política de privacidade", "p1": "Este site é do Café Príncipe ({morada}; telefone {tel}).", "p2": "O site não tem formulários e não recolhe dados pessoais. As encomendas e as reservas são feitas por telefone, diretamente com o café.", "p3": "Não usamos cookies de rastreio nem de publicidade. O site guarda no seu dispositivo apenas a língua que escolheu (para se lembrar dela na próxima visita) e uma cópia do menu, para o poder abrir sem rede.", "p4": "Para mostrar os tipos de letra, o seu navegador pede-os ao Google Fonts, o que pode enviar o seu endereço IP ao Google.", "p5": "Contamos as visitas com o Cloudflare Web Analytics, que, segundo a Cloudflare, não usa cookies.", "p6": "O site está alojado na Cloudflare, que pode registar o endereço IP de quem o visita por razões técnicas e de segurança.", "p7": "Os botões do Google Maps e do Waze abrem esses serviços, que têm as suas próprias políticas de privacidade.", "p8": "Se tiver dúvidas sobre os seus dados, contacte o café pelo telefone acima. Também pode apresentar queixa à Comissão Nacional de Proteção de Dados (www.cnpd.pt)."};
function montarPriv(){
  const tel = n => `<a href="tel:${n.replace(/\s/g,"")}">${n}</a>`;
  $("#privTitulo").textContent = T(PRIV_PT.t);
  $("#privCorpo").innerHTML = PRIV.filter(k => (k !== "p4" || CAFE.fontesGoogle) && (k !== "p5" || (CAFE.analitica && CAFE.analitica.cloudflareToken)))
    .map(k => `<p>${T(PRIV_PT[k]).replace("{morada}", CAFE.morada).replace("{tel}", tel(TELEFONES.encomendas))}</p>`).join("");
}
const dlgPriv = $("#dlgPriv");
$("#abrirPriv").addEventListener("click", e => { e.preventDefault(); montarPriv(); if(dlgPriv.showModal) dlgPriv.showModal(); else dlgPriv.setAttribute("open",""); });
$("#fecharPriv").addEventListener("click", () => dlgPriv.close ? dlgPriv.close() : dlgPriv.removeAttribute("open"));
dlgPriv.addEventListener("click", e => { if(e.target === dlgPriv) dlgPriv.close(); });   // clicar fora fecha

/* ============ SELETOR DE IDIOMA ============ */
const rotularTabs = () => tabs.querySelectorAll(".tab").forEach(b => { b.textContent = nomeCat(b.dataset.cat); });
const listaIdiomas = $("#idiomaLista"), btnIdioma = $("#idiomaBtn");
listaIdiomas.innerHTML = Object.entries(IDIOMAS).map(([k,n]) => `<li role="option" tabindex="0" data-l="${k}" aria-selected="${k === "pt"}"><span class="bandeira">${BANDEIRAS[k]}</span>${n}</li>`).join("");
const fecharIdiomas = () => { listaIdiomas.hidden = true; btnIdioma.setAttribute("aria-expanded","false"); };
function ajustarNav(){
  const h = document.querySelector("header"), n = h.querySelector(".nav");
  h.classList.remove("nav-compacta");
  if(getComputedStyle(h.querySelector(".links")).display !== "none" && n.scrollWidth > n.clientWidth + 1) h.classList.add("nav-compacta");
  medirHeader();
}
addEventListener("resize", ajustarNav);
if(document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarNav);

function setLang(l, guardar = true){
  if(!IDIOMAS[l]) l = "pt";
  LANG = l;
  document.documentElement.lang = {pt:"pt-PT", en:"en", fr:"fr", de:"de", es:"es"}[l];
  if(guardar){ try{ localStorage.setItem("idioma", l); }catch(e){} }
  traduzirDOM(); montarPriv(); montarPratoDia(); montarAviso(); montarPedido(); atualizarPausa(); rotularTabs(); montarFaixa(); montarSobre(); montarAvaliacoes(); montarFaq(); montarMaisPedidos();
  if(consulta) pesquisar(consulta); else mostrarCategoria(catAtual || "Francesinhas");
  if(pratoAtual){ montarPrato(); }
  atualizarEstado(); atualizarJSONLD(); $("#horarioTxt").innerHTML = horarioTexto(); $("#rodHorario").innerHTML = horarioTexto();
  topoAtualizar();
  $("#idiomaAtual").textContent = l.toUpperCase(); $("#idiomaBandeira").innerHTML = BANDEIRAS[l];
  listaIdiomas.querySelectorAll("li").forEach(li => li.setAttribute("aria-selected", li.dataset.l === l));
  const md = document.querySelector('meta[name="description"]'); if(md && !pratoAtual) md.content = META_DESC[l];
  ajustarNav();
}
btnIdioma.addEventListener("click", () => { carregarTraducoes().catch(() => {}); });   // aproveita o tempo em que a pessoa escolhe para já ir buscar as traduções
btnIdioma.addEventListener("click", e => { e.stopPropagation(); const abrir = listaIdiomas.hidden; listaIdiomas.hidden = !abrir; btnIdioma.setAttribute("aria-expanded", String(abrir)); if(abrir){ const sel = listaIdiomas.querySelector('[aria-selected="true"]'); if(sel) sel.focus(); } });
btnIdioma.addEventListener("keydown", e => { if(e.key === "ArrowDown" && listaIdiomas.hidden){ e.preventDefault(); btnIdioma.click(); } });
listaIdiomas.addEventListener("keydown", e => {
  const lis = [...listaIdiomas.querySelectorAll("li")], i = lis.indexOf(document.activeElement);
  if(e.key === "ArrowDown"){ e.preventDefault(); lis[(i + 1) % lis.length].focus(); }
  else if(e.key === "ArrowUp"){ e.preventDefault(); lis[(i - 1 + lis.length) % lis.length].focus(); }
  else if(e.key === "Home"){ e.preventDefault(); lis[0].focus(); }
  else if(e.key === "End"){ e.preventDefault(); lis[lis.length - 1].focus(); }
  else if(e.key === "Escape"){ fecharIdiomas(); btnIdioma.focus(); }
});
listaIdiomas.addEventListener("click", e => { const li = e.target.closest("li"); if(li){ mudarLang(li.dataset.l); fecharIdiomas(); } });
listaIdiomas.addEventListener("keydown", e => { if((e.key === "Enter" || e.key === " ") && e.target.dataset.l){ e.preventDefault(); mudarLang(e.target.dataset.l); fecharIdiomas(); btnIdioma.focus(); } });
document.addEventListener("click", fecharIdiomas);
addEventListener("keydown", e => { if(e.key === "Escape") fecharIdiomas(); });
/* idioma inicial: o que a pessoa escolheu da última vez, ou o do telemóvel (se for um dos 5) */
let idiomaInicial = ""; try{ idiomaInicial = localStorage.getItem("idioma") || ""; }catch(e){}
if(!IDIOMAS[idiomaInicial]){ const n = (navigator.language || "pt").slice(0,2).toLowerCase(); idiomaInicial = IDIOMAS[n] ? n : "pt"; }
$("#idiomaBandeira").innerHTML = BANDEIRAS.pt;
if(idiomaInicial !== "pt") mudarLang(idiomaInicial, false); else { montarPriv(); atualizarPausa(); ajustarNav(); }
rota();
/* menu disponível sem rede: guarda uma cópia do site depois da primeira visita (precisa do ficheiro sw.js ao lado do index.html) */
if("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) addEventListener("load", () => { navigator.serviceWorker.register("/sw.js").catch(() => {}); });
atualizarJSONLD(); montarPedido();

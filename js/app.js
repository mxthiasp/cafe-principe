/* ============================================================
   FUNCIONAMENTO DO SITE (js/app.js)
   A lógica: separadores do menu, pesquisa, páginas de cada prato, horário aberto/fechado,
   idiomas, animações e política de privacidade. Normalmente não precisas de mexer aqui.
   Os dados estão em js/cafe.js, js/menu.js e js/traducoes.js.
   ============================================================ */
let LANG = "pt";   // idioma atual
/* ============ BOTÕES "LIGAR" (os números estão em js/cafe.js) ============ */
document.querySelector(".cart-btn .num").textContent = TELEFONES.encomendas;
document.querySelectorAll("[data-tel]").forEach(a => {
  const n = TELEFONES[a.dataset.tel];
  a.href = "tel:" + n.replace(/\s/g, "");
  if(!a.hasAttribute("data-sem-texto")) a.textContent = a.dataset.rotulo || n;
});


/* ============ IDIOMAS (PT, EN, FR, DE, ES) ============ */
const T = pt => { const e = DICT[pt]; return (LANG === "pt" || !e) ? pt : (e[IDX[LANG]] || pt); };
const nomeCat = c => LANG === "pt" ? c : (((CAT_I18N[c] || [])[IDX[LANG]]) || c);
const nomePrato = p => LANG === "pt" ? p.nome : ((((MENU_I18N[p.nome] || {}).n || [])[IDX[LANG]]) || p.nome);
const descPrato = p => LANG === "pt" ? p.desc : (((MENU_I18N[p.nome] || {}).d || [])[IDX[LANG]] ?? p.desc);
/* traduz todos os textos fixos da página (guarda o texto original em português) */
const _orig = new WeakMap(), _origAttr = new WeakMap();
function traduzirDOM(){
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {acceptNode: n =>
    (n.parentElement && n.parentElement.closest("script,style,svg,#menuImpressao")) || !n.nodeValue.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
  let n; while((n = w.nextNode())){
    if(!_orig.has(n)) _orig.set(n, n.nodeValue);
    const pt = _orig.get(n), chave = pt.trim();
    n.nodeValue = pt.replace(chave, T(chave));
  }
  document.querySelectorAll("[aria-label],[alt],[placeholder]").forEach(el => {
    const o = _origAttr.get(el) || {};
    ["aria-label","alt","placeholder"].forEach(a => { if(el.hasAttribute(a)){ if(!(a in o)) o[a] = el.getAttribute(a); el.setAttribute(a, T(o[a])); } });
    _origAttr.set(el, o);
  });
}

/* Domingo de Páscoa (algoritmo de Gauss/Meeus) */
function pascoa(a){
  const A=a%19, B=Math.floor(a/100), C=a%100, D=Math.floor(B/4), E=B%4, F=Math.floor((B+8)/25), G=Math.floor((B-F+1)/3),
        H=(19*A+B-D-G+15)%30, I=Math.floor(C/4), K=C%4, L=(32+2*E+2*I-H-K)%7, M=Math.floor((A+11*H+22*L)/451), x=H+L-7*M+114;
  return new Date(a, Math.floor(x/31)-1, (x%31)+1);
}
const chaveData = d => String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
/* feriados nacionais de Portugal: fixos + Sexta-feira Santa, Páscoa e Corpo de Deus */
function eFeriado(d){
  const fixos = ["01-01","04-25","05-01","06-10","08-15","10-05","11-01","12-01","12-08","12-25"];
  const p = pascoa(d.getFullYear());
  const moveis = [-2, 0, 60].map(n => chaveData(new Date(p.getFullYear(), p.getMonth(), p.getDate()+n)));
  return [...fixos, ...moveis, ...FERIADOS_LOCAIS].includes(chaveData(d));
}
/* Hora de Portugal, mesmo que o cliente tenha o telemóvel noutro fuso */
const agoraLisboa = () => new Date(new Date().toLocaleString("en-US",{timeZone:"Europe/Lisbon"}));
const minutos = h => +h.slice(0,2)*60 + +h.slice(3);
const hh = h => { if(h === "24:00") h = "00:00"; return LANG === "pt" ? h.replace(":","h") : h; };
const fmt = (tpl, o) => tpl.replace("{h}", o.h || "").replace("{d}", o.d || "");
/* intervalos de abertura de um dia concreto, já com feriados e dias de fecho */
function intervalosDoDia(d){
  const mmdd = chaveData(d);
  if(DIAS_FECHADOS.includes(d.getFullYear() + "-" + mmdd) || DIAS_FECHADOS.includes(mmdd)) return [];
  const iv = HORARIO[d.getDay()] || [];
  return eFeriado(d) ? [[FERIADO.abreApartir, FERIADO.fechaAs]] : iv;
}
function estadoAbertura(d = agoraLisboa()){
  const L = L_TXT[LANG], m = d.getHours()*60 + d.getMinutes();
  for(const [a,b] of intervalosDoDia(d)) if(m >= minutos(a) && m < minutos(b)) return {aberto:true, texto:fmt(L.aberto,{h:hh(b)})};
  for(let k=0;k<9;k++){
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate()+k);
    for(const [a] of intervalosDoDia(dd)) if(k>0 || minutos(a) > m)
      return {aberto:false, texto:fmt(k===0 ? L.hoje : k===1 ? L.amanha : L.dia, {h:hh(a), d:DIAS[LANG][dd.getDay()]})};
  }
  return {aberto:false, texto:L.fechado};
}
function horarioTexto(){
  const L = L_TXT[LANG], D = DIAS[LANG], ordem=[1,2,3,4,5,6,0], grupos=[];
  ordem.forEach(dia => {
    const txt=(HORARIO[dia]||[]).map(([a,b])=>`${hh(a)} – ${hh(b)}`).join(L.e) || L.fechado;
    const g=grupos[grupos.length-1];
    if(g && g.txt===txt) g.fim=dia; else grupos.push({ini:dia,fim:dia,txt});
  });
  return grupos.map(g => `${D[g.ini]}${g.ini!==g.fim?L.a+D[g.fim]:""}: ${g.txt}`).join("<br>") + "<br>" + fmt(L.fer, {h:`${hh(FERIADO.abreApartir)} – ${hh(FERIADO.fechaAs)}`}) + "<br>" + L.fec;
}
function atualizarEstado(){
  const e = estadoAbertura();
  $("#estado").className = "estado" + (e.aberto ? " aberto" : "");
  $("#estado").innerHTML = `<i class="ponto"></i>${e.texto}`;
  /* com o café fechado, a barra de ligar avisa quando abre */
  const barra = $(".barra-ligar"), aviso = barra.querySelector("small") || barra.appendChild(document.createElement("small"));
  aviso.textContent = e.aberto ? "" : e.texto;
}

/* ============ UTILITÁRIOS ============ */
const euro = n => LANG === "en" ? "€" + n.toFixed(2) : n.toFixed(2).replace(".", ",") + " €";
const $ = s => document.querySelector(s);
const slug = t => t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
/* clique normal: abre o prato sem recarregar; com Ctrl, Shift ou Cmd deixa o navegador abrir o link noutro separador */
const cliqueSimples = e => !(e.ctrlKey || e.metaKey || e.shiftKey || e.altKey);

/* ============ 3. TABS DO MENU ============ */
const tabs = $("#tabs"), grelha = $("#grelha");

/* "Favorito da casa": coroa (do logótipo) + texto, alinhados ao centro */
const COROA = '<svg class="coroa" viewBox="0 0 24 20" aria-hidden="true" focusable="false"><path d="M1.5 4.5 7 9l5-7.5L17 9l5.5-4.5L20.4 16.5H3.6z" fill="currentColor"/><rect x="3.6" y="17.8" width="16.8" height="2.2" rx=".6" fill="currentColor"/></svg>';
const favorito = () => `<span class="favorito">${COROA}<span>${T("Favorito da casa")}</span></span>`;
function cartaoHTML(p, i){
  const nome = nomePrato(p);
  return `
    <div class="card-wrap" style="--i:${i}"><a class="card novo" style="--i:${i}" href="${urlPrato(p.nome)}" data-nome="${p.nome}">
      ${p.foto ? `<div class="foto"><img src="${p.foto}" alt="${nome}" loading="lazy" decoding="async"></div>` : `<div class="foto foto--vazia"></div>`}
      <h3>${nome}</h3>${p.destaque ? favorito() : ""}
      <p>${descPrato(p)}</p>
      <div class="card-fim">
        ${p.preco > 0 ? `<span class="preco">${euro(p.preco)}</span>` : `<span class="preco preco--vazio">${T("Preço a confirmar")}</span>`}
        <span class="ver-mais" aria-hidden="true">${T("Ver detalhes")} ›</span>
      </div>
    </a>${botaoJuntar(p)}</div>`;
}
const ROTAS_LIMPAS = CAFE.enderecosLimpos !== false && /^https?:$/.test(location.protocol);   // /prato/nome; em ficheiro local usa #/prato/nome
const urlPrato = nome => (ROTAS_LIMPAS ? "/prato/" : "#/prato/") + slug(nome);
let consulta = "";
let catAtual = null;
function mostrarCategoria(cat, dir = 0){
  if(consulta){ consulta = ""; $("#pesq").value = ""; $("#pesqLimpar").hidden = true; $("#pesqInfo").textContent = ""; $("#barraTabs").classList.remove("a-pesquisar"); }
  // Marca a tab ativa
  tabs.querySelectorAll(".tab").forEach(t => { t.setAttribute("aria-selected", t.dataset.cat === cat); t.tabIndex = t.dataset.cat === cat ? 0 : -1; });
  catAtual = cat;
  // centra o separador ativo na barra
  const at = tabs.querySelector('[aria-selected="true"]');
  if(at) grelha.setAttribute("aria-labelledby", at.id);
  if(at) tabs.scrollTo({left: at.getBoundingClientRect().left - tabs.getBoundingClientRect().left + tabs.scrollLeft - (tabs.clientWidth - at.offsetWidth)/2, behavior:"smooth"});
  // os cartões entram do lado para onde se desliza (sem direção: de baixo)
  grelha.style.setProperty("--dx", dir * 46 + "px"); grelha.style.setProperty("--dy", dir ? "0px" : "24px");
  // Redesenha os cartões (a classe "novo" dispara a animação)
  grelha.innerHTML = MENU[cat].map(cartaoHTML).join("");
}

Object.keys(MENU).forEach(cat => {
  const b = document.createElement("button");
  b.className = "tab"; b.id = "tab-" + slug(cat); b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "grelha"); b.dataset.cat = cat; b.textContent = nomeCat(cat);
  b.onclick = () => { if(tabs.dataset.moveu === "1") return; const cats = Object.keys(MENU); mostrarCategoria(cat, Math.sign(cats.indexOf(cat) - cats.indexOf(catAtual)));  const m=$("#menu"); if(m.getBoundingClientRect().top < 0) m.scrollIntoView({behavior:"smooth"}); };
  tabs.appendChild(b);
});

/* setas do teclado nos separadores */
tabs.addEventListener("keydown", e => {
  const lista = [...tabs.querySelectorAll(".tab")], i = lista.indexOf(document.activeElement);
  const j = {ArrowRight:i + 1, ArrowLeft:i - 1, Home:0, End:lista.length - 1}[e.key];
  if(i < 0 || j === undefined || !lista[j]) return;
  e.preventDefault(); mostrarCategoria(lista[j].dataset.cat, Math.sign(j - i)); lista[j].focus();
});

/* ============ ARRANQUE ============ */
const medirHeader = () => document.documentElement.style.setProperty("--alt-header", document.querySelector("header").offsetHeight + "px");
medirHeader(); addEventListener("resize", medirHeader);
atualizarEstado(); setInterval(atualizarEstado, 60000);
$("#moradaTxt").textContent = CAFE.morada;
/* Como chegar: cada botão abre a app de mapas do cliente já com o destino preenchido. O Apple Maps só aparece em iPhone, iPad e Mac. */
const _destino = encodeURIComponent(CAFE.morada);
$("#gmaps").href = "https://www.google.com/maps/dir/?api=1&destination=" + _destino;
$("#waze").href = "https://waze.com/ul?navigate=yes&q=" + _destino;
$("#apple").href = "https://maps.apple.com/?daddr=" + _destino + "&dirflg=d";
const _apple = /iPhone|iPad|iPod/.test(navigator.userAgent) || /Mac/.test(navigator.platform || "") || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));
if(_apple){ $("#apple").hidden = false; $("#gmaps").classList.remove("btn-sec--cta"); } else { $("#gmaps").classList.add("btn-sec--cta"); }
if(CAFE.fotoFachada){ const f = $("#chegarFoto"); f.innerHTML = `<img src="${CAFE.fotoFachada}" alt="${T("Entrada do Café Príncipe")}" loading="lazy" decoding="async">`; f.hidden = false; $("#chegar").classList.add("com-foto"); }
$("#horarioTxt").innerHTML = horarioTexto();
if(CAFE.tempoPreparacao) $("#tempoPrep").textContent = CAFE.tempoPreparacao;
if(CAFE.fotoHero){ const h=document.querySelector(".hero"); h.classList.add("hero--foto"); h.style.setProperty("--hero-foto",`url("${CAFE.fotoHero}")`); }   // foto como fundo do hero
$("#rodHorario").innerHTML = horarioTexto(); $("#rodMorada").textContent = CAFE.morada;
/* cabeçalho que encolhe ao descer (com folga, para não "tremer") */
const cab = document.querySelector("header");
addEventListener("scroll", () => {
  const y = scrollY, c = cab.classList.contains("compacto");
  if(!c && y > 70) { cab.classList.add("compacto"); setTimeout(medirHeader, 300); }
  else if(c && y < 20) { cab.classList.remove("compacto"); setTimeout(medirHeader, 300); }
}, {passive:true});
/* ============ SOBRE NÓS E AVALIAÇÕES ============ */
function montarSobre(){
  const c = CAFE.sobreNos;
  $("#sobreTitulo").textContent = T(c.titulo);
  const texto = c.texto.map(t => `<p>${T(t)}</p>`).join("");
  const factos = `<div class="factos">
    <div class="facto"><strong>${T("Salsa caseira")}</strong><span>${T("A salsa das francesinhas é feita por nós.")}</span></div>
    <div class="facto"><strong>${T("No café ou para levar")}</strong><span>${T("Come cá, ou encomenda e levanta.")}</span></div>
    <div class="facto"><strong>${T("Reservas de mesa")}</strong><span>${T("Reserva por telefone.")}</span></div></div>`;
  const corpo = $("#sobreCorpo");
  if(c.foto){
    corpo.className = "sobre sobre--foto";
    corpo.innerHTML = `<div class="foto"><img src="${c.foto}" alt="Café Príncipe" loading="lazy" decoding="async"></div><div>${texto}${factos}</div>`;
  } else {
    corpo.className = "sobre";
    corpo.innerHTML = `<div>${texto}</div>${factos}`;
  }
}
function montarAvaliacoes(){
  const a = CAFE.avaliacoes, sec = $("#avaliacoes");
  sec.hidden = !a.itens.length;                       // sem avaliações reais, a secção não aparece
  if(!a.itens.length) return;
  $("#listaAvaliacoes").innerHTML = a.itens.map(i => {
    const n = Math.max(0, Math.min(5, i.estrelas || 5));
    return `<div class="aval"><div class="estrelas" aria-label="${n} ${T("de 5 estrelas")}">${"★".repeat(n)}${"☆".repeat(5-n)}</div><p>“${i.texto}”</p><div class="aval-nome">${i.nome}</div></div>`;
  }).join("");
  $("#maisAval").innerHTML =
    (a.linkGoogle ? `<a class="btn-sec" href="${a.linkGoogle}" target="_blank" rel="noopener">${T("Ver todas no Google")}</a>` : "") +
    (a.linkDeixar ? `<a class="btn-sec" href="${a.linkDeixar}" target="_blank" rel="noopener">${T("Deixa a tua avaliação")}</a>` : "");
}
function montarFaq(){
  const tel = n => `<a href="tel:${n.replace(/\s/g,"")}">${n}</a>`, ambos = tel(TELEFONES.encomendas) + " / " + tel(TELEFONES.reservas);
  $("#faqLista").innerHTML = FAQ.map(([q,r]) => `<details><summary>${T(q)}</summary><p>${
    T(r).replace("{tel_reservas}", ambos).replace("{tel}", ambos).replace("{feriado}", hh(FERIADO.abreApartir)).replace("{morada}", CAFE.morada)}</p></details>`).join("");
}
montarSobre(); montarAvaliacoes(); montarFaq();

/* ============ OS MAIS PEDIDOS ============ */
const destaques = [];
Object.entries(MENU).forEach(([cat, itens]) => itens.forEach(p => { if(p.destaque) destaques.push({cat, p}); }));
destaques.sort((a,b) => { const i = ORDEM_DESTAQUES.indexOf(a.p.nome), j = ORDEM_DESTAQUES.indexOf(b.p.nome); return (i<0?99:i) - (j<0?99:j); });
function irParaPrato(cat, nome){
  const cats = Object.keys(MENU);
  mostrarCategoria(cat, Math.sign(cats.indexOf(cat) - cats.indexOf(catAtual)));
  setTimeout(() => {
    const alvo = [...grelha.children].find(c => c.dataset.nome === nome);
    if(!alvo) return;
    alvo.scrollIntoView({behavior:"smooth", block:"center"});
    alvo.classList.add("realce"); setTimeout(() => alvo.classList.remove("realce"), 2400);
  }, 150);
}
function montarMaisPedidos(){
  if(!destaques.length) return;
  $("#maisPedidos").hidden = false;
  $("#listaMaisPedidos").innerHTML = destaques.map(({cat,p},k) => {
    const nome = nomePrato(p);
    return `
    <a class="card card--destaque novo" style="--i:${k}" href="${urlPrato(p.nome)}" data-cat="${cat}" data-nome="${p.nome}">
      ${p.foto ? `<div class="foto"><img src="${p.foto}" alt="${nome}" loading="lazy" decoding="async"></div>` : `<div class="foto foto--vazia"></div>`}
      <h3>${nome}</h3>
      <div class="card-fim">${p.preco > 0 ? `<span class="preco">${euro(p.preco)}</span>` : `<span class="preco preco--vazio">${T("Preço a confirmar")}</span>`}</div>
    </a>`; }).join("");
  $("#listaMaisPedidos").querySelectorAll(".card--destaque").forEach(el => {
    el.addEventListener("click", e => { if(cliqueSimples(e)){ e.preventDefault(); abrirPrato(el.dataset.nome); } });
  });
}
montarMaisPedidos();

/* ============ PÁGINA DE CADA PRATO (endereço: #/prato/nome-do-prato) ============ */
const PRATOS = []; Object.entries(MENU).forEach(([cat, itens]) => itens.forEach(p => PRATOS.push({p, cat, slug:slug(p.nome)})));
const porSlug = Object.fromEntries(PRATOS.map(x => [x.slug, x]));

/* ============ PRATO DO DIA E FAIXA DE AVISO ============ */
/* "ate" (AAAA-MM-DD): o aviso/prato aparece até ao fim desse dia */
const aindaValido = ate => { if(!ate) return true; const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}` <= ate; };
function montarPratoDia(){
  const pd = CAFE.pratoDoDia, el = $("#pratoDia");
  if(!pd || !pd.ativo || !aindaValido(pd.ate)){ el.hidden = true; el.innerHTML = ""; return; }
  const x = pd.prato && PRATOS.find(y => y.p.nome === pd.prato);
  const nome = x ? nomePrato(x.p) : pd.nome, desc = x ? descPrato(x.p) : pd.desc, preco = x ? x.p.preco : pd.preco;
  const etiqueta = `<span class="etiqueta">${T("Prato do dia")}</span>`;
  const precoHTML = preco > 0 ? `<span class="preco">${euro(preco)}</span>` : `<span class="preco preco--vazio">${T("Preço a confirmar")}</span>`;
  el.hidden = false;
  if(x){
    const nova = document.createElement("a"); nova.className = el.className; nova.id = "pratoDia"; nova.href = urlPrato(x.p.nome); nova.dataset.prato = x.p.nome;
    nova.innerHTML = `<div>${etiqueta}<h3>${nome}</h3><p>${desc}</p></div><div class="card-fim">${precoHTML}<span class="ver-mais">${T("Ver este prato")} ›</span></div>`;
    el.replaceWith(nova);
  } else {
    if(el.tagName === "A"){ const d = document.createElement("div"); d.className = el.className; d.id = "pratoDia"; el.replaceWith(d); }
    $("#pratoDia").innerHTML = `<div>${etiqueta}<h3>${nome}</h3><p>${desc}</p></div><div class="card-fim">${precoHTML}</div>`;
  }
}
function montarAviso(){
  const av = CAFE.aviso, el = $("#aviso");
  if(!av || !av.ativo || !av.texto || !aindaValido(av.ate)){ el.hidden = true; return; }
  const txt = typeof av.texto === "string" ? T(av.texto) : (av.texto[LANG] || av.texto.pt || "");
  let fechado = false; try{ fechado = sessionStorage.getItem("avisoFechado") === (typeof av.texto === "string" ? av.texto : JSON.stringify(av.texto)); }catch(e){}
  if(fechado || !txt){ el.hidden = true; return; }
  $("#avisoTexto").textContent = txt; el.hidden = false;
}
$("#avisoFechar").addEventListener("click", () => {
  $("#aviso").hidden = true;
  try{ sessionStorage.setItem("avisoFechado", typeof CAFE.aviso.texto === "string" ? CAFE.aviso.texto : JSON.stringify(CAFE.aviso.texto)); }catch(e){}
});

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
  const preco = p.preco > 0 ? `<span class="prato-preco">${euro(p.preco)}</span>` : `<span class="prato-preco prato-preco--vazio">${T("Preço a confirmar")}</span>`;
  const foto = p.foto ? `<div class="prato-foto"><img src="${p.foto}" alt="${nome}" decoding="async"></div>` : `<div class="prato-foto prato-foto--vazia"></div>`;
  const factos = [[T("Categoria"), nomeCat(cat)], p.porcao && [T("Porção"), T(p.porcao)], p.alergenios && [T("Alergénios"), T(p.alergenios)]].filter(Boolean);
  const tel = TELEFONES.encomendas;
  $("#paginaPrato").innerHTML = `<div class="wrap">
    <nav class="migalhas" aria-label="${T("Menu")}"><a href="#menu">${T("Menu")}</a><span aria-hidden="true">›</span><button type="button" data-cat="${cat}">${nomeCat(cat)}</button><span aria-hidden="true">›</span><span aria-current="page">${nome}</span></nav>
    <div class="prato-grelha">
      ${foto}
      <div class="prato-info">
        <h1 id="pratoTitulo">${nome}</h1>
        ${p.destaque ? favorito() : ""}
        ${preco}
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
        <div class="foto${x.p.foto ? "" : " foto--vazia"}">${x.p.foto ? `<img src="${x.p.foto}" alt="${nomePrato(x.p)}" loading="lazy" decoding="async">` : ""}</div>
        <h3>${nomePrato(x.p)}</h3>
        <div class="card-fim">${x.p.preco > 0 ? `<span class="preco">${euro(x.p.preco)}</span>` : `<span class="preco preco--vazio">${T("Preço a confirmar")}</span>`}<span class="ver-mais" aria-hidden="true">${T("Ver detalhes")} ›</span></div>
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
/* ============ PESQUISA NO MENU ============ */
const norm = t => (t || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function pesquisar(q){
  consulta = q.trim();
  const barra = $("#barraTabs"), info = $("#pesqInfo");
  $("#pesqLimpar").hidden = !consulta;
  if(!consulta){ barra.classList.remove("a-pesquisar"); info.textContent = ""; mostrarCategoria(catAtual || "Francesinhas"); return; }
  const tokens = norm(consulta).split(/\s+/).filter(Boolean);
  const res = PRATOS.filter(x => { const alvo = norm([nomePrato(x.p), descPrato(x.p), nomeCat(x.cat), x.p.nome, x.p.desc].join(" ")); return tokens.every(t => alvo.includes(t)); });
  barra.classList.add("a-pesquisar"); tabs.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", "false"));
  grelha.style.setProperty("--dx", "0px"); grelha.style.setProperty("--dy", "24px");
  if(res.length) grelha.innerHTML = res.map((x,i) => cartaoHTML(x.p, i)).join("");
  else { grelha.innerHTML = ""; const m = document.createElement("p"); m.className = "sem-resultados"; m.textContent = T("Sem resultados para") + " “" + consulta + "”."; grelha.appendChild(m); }
  info.textContent = res.length === 1 ? T("1 prato") : res.length ? T("{n} pratos").replace("{n}", res.length) : "";
}
$("#pesq").addEventListener("input", e => pesquisar(e.target.value));
$("#pesq").addEventListener("keydown", e => { if(e.key === "Escape"){ e.target.value = ""; pesquisar(""); } });
$("#pesqLimpar").addEventListener("click", () => { $("#pesq").value = ""; pesquisar(""); $("#pesq").focus(); });
/* cartões do menu: abrem a página do prato */
grelha.addEventListener("click", e => { const c = e.target.closest(".card"); if(c && cliqueSimples(e)){ e.preventDefault(); abrirPrato(c.dataset.nome); } });
/* o endereço manda: /prato/nome (ou #/prato/nome) mostra o prato; qualquer outro mostra o início */
function rota(){
  const mp = ROTAS_LIMPAS ? location.pathname.match(/^\/prato\/([a-z0-9-]+)\/?$/) : null, mh = location.hash.match(/^#\/prato\/([a-z0-9-]+)$/);
  const slugPedido = mp ? mp[1] : (mh ? mh[1] : null), vista = document.body.classList.contains("vista-prato");
  if(slugPedido && porSlug[slugPedido]){
    if(ROTAS_LIMPAS && mh && !mp) history.replaceState({}, "", "/prato/" + slugPedido);   // ligações antigas com # passam ao endereço limpo
    if(!vista) scrollInicio = scrollY;
    pratoAtual = porSlug[slugPedido]; montarPrato();
    document.body.classList.add("vista-prato");
    scrollTo({top:0, left:0, behavior:"instant"});
    $("#paginaPrato").focus({preventScroll:true});
  } else {
    if(ROTAS_LIMPAS && /^\/prato\//.test(location.pathname)) history.replaceState({}, "", "/");   // prato que não existe: volta ao início
    if(vista){
      document.body.classList.remove("vista-prato"); pratoAtual = null;
      if(scrollInicio > 70) cab.classList.add("compacto");   // o cabeçalho já estava encolhido quando saíste do início
      document.title = tituloBase; const md = document.querySelector('meta[name="description"]'); if(md) md.content = META_DESC[LANG];
      const h = location.hash, alvo = h.length > 1 && !h.startsWith("#/") ? document.getElementById(h.slice(1)) : null;
      if(alvo) alvo.scrollIntoView({behavior:"instant"}); else scrollTo({top:scrollInicio, left:0, behavior:"instant"});
    }
  }
}
addEventListener("hashchange", rota);
addEventListener("popstate", rota);
/* ligações como "#menu" ou "#topo" a partir da página de um prato levam ao início */
document.addEventListener("click", e => {
  if(e.defaultPrevented || !ROTAS_LIMPAS || !document.body.classList.contains("vista-prato")) return;
  const a = e.target.closest('a[href^="#"]'); if(!a) return;
  const h = a.getAttribute("href"); if(h.startsWith("#/")) return;
  e.preventDefault(); navegarInicio(h.slice(1));
});

/* partilhar o menu (folha de partilhar do telemóvel, ou WhatsApp no computador) */
$("#partilhar").onclick = async () => {
  const url = location.href.split("#")[0], texto = T("Vê o menu do Café Príncipe");
  if(navigator.share){ try{ await navigator.share({title:"Café Príncipe", text:texto, url}); }catch(e){} }
  else open("https://wa.me/?text=" + encodeURIComponent(texto + ": " + url), "_blank", "noopener");
};
/* menu completo para imprimir ou guardar em PDF (no idioma escolhido) */
$("#imprimir").onclick = () => {
  const tel = TELEFONES.encomendas + " / " + TELEFONES.reservas;
  $("#menuImpressao").innerHTML =
    `<div class="im-topo"><svg class="im-logo" viewBox="100 40 1010 290" aria-hidden="true"><use href="#logo-cp"/></svg><div class="im-contacto"><b>${tel}</b>${CAFE.morada}</div></div>` +
    `<div class="im-titulo">${T("Menu")}</div><div class="cols">` +
    Object.entries(MENU).map(([cat, itens]) => `<div class="cat"><h2>${nomeCat(cat)}</h2>` + itens.map(p =>
      `<div class="it"><b>${nomePrato(p)}</b>${p.preco > 0 ? `<span class="pr">${euro(p.preco)}</span>` : ""}<small>${descPrato(p)}</small></div>`).join("") + `</div>`).join("") +
    `</div><div class="im-alergenios">${T("Tens alguma alergia ou intolerância? Fala connosco antes de encomendar:")} ${tel}</div><div class="im-rodape"><span>Café Príncipe · ${CAFE.morada}</span><span>${tel}</span></div>`;
  print();
};

/* ============ MENU DESLIZANTE ============ */
const barraTabs = $("#barraTabs");
function bordas(){
  const max = tabs.scrollWidth - tabs.clientWidth;
  barraTabs.classList.toggle("borda-esq", tabs.scrollLeft > 4);
  barraTabs.classList.toggle("borda-dir", tabs.scrollLeft < max - 4);
}
tabs.addEventListener("scroll", bordas, {passive:true}); addEventListener("resize", bordas); bordas();
$("#setaEsq").onclick = () => tabs.scrollBy({left: -tabs.clientWidth * .7, behavior:"smooth"});
$("#setaDir").onclick = () => tabs.scrollBy({left:  tabs.clientWidth * .7, behavior:"smooth"});
/* arrastar os separadores com o rato (no telemóvel o dedo já faz isto) */
let arr = null;
tabs.addEventListener("pointerdown", e => { if(e.pointerType !== "mouse") return; arr = {x:e.clientX, sl:tabs.scrollLeft, mov:false}; });
addEventListener("pointermove", e => {
  if(!arr) return; const dx = e.clientX - arr.x;
  if(Math.abs(dx) > 5){ arr.mov = true; tabs.classList.add("a-arrastar"); }
  if(arr.mov) tabs.scrollLeft = arr.sl - dx;
});
addEventListener("pointerup", () => {
  if(!arr) return;
  if(arr.mov){ tabs.dataset.moveu = "1"; setTimeout(() => { tabs.dataset.moveu = "0"; }, 50); }
  tabs.classList.remove("a-arrastar"); arr = null;
});
/* deslizar para o lado nos cartões muda de categoria */
let toque = null;
grelha.addEventListener("touchstart", e => { const t = e.touches[0]; toque = {x:t.clientX, y:t.clientY}; }, {passive:true});
grelha.addEventListener("touchend", e => {
  if(!toque || consulta) return; const t = e.changedTouches[0], dx = t.clientX - toque.x, dy = t.clientY - toque.y; toque = null;
  if(Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
  const cats = Object.keys(MENU), i = cats.indexOf(catAtual) + (dx < 0 ? 1 : -1);
  if(i >= 0 && i < cats.length) mostrarCategoria(cats[i], dx < 0 ? 1 : -1);
}, {passive:true});

/* ============ ANIMAÇÕES ============ */
const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroEl = document.querySelector(".hero");
/* título do topo: as palavras sobem uma a uma */
const h1 = heroEl.querySelector("h1");
function escreverTitulo(txt){
  h1.setAttribute("aria-label", txt.trim());
  h1.innerHTML = txt.trim().split(/\s+/).map((w,i) => `<span class="pal" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(" ");
}
escreverTitulo(h1.textContent);
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
    heroExtra.innerHTML = x.preco > 0 ? `<span class="hero-preco">${euro(x.preco)}</span>` : "";
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
listaIdiomas.addEventListener("click", e => { const li = e.target.closest("li"); if(li){ setLang(li.dataset.l); fecharIdiomas(); } });
listaIdiomas.addEventListener("keydown", e => { if((e.key === "Enter" || e.key === " ") && e.target.dataset.l){ e.preventDefault(); setLang(e.target.dataset.l); fecharIdiomas(); btnIdioma.focus(); } });
document.addEventListener("click", fecharIdiomas);
addEventListener("keydown", e => { if(e.key === "Escape") fecharIdiomas(); });
/* idioma inicial: o que a pessoa escolheu da última vez, ou o do telemóvel (se for um dos 5) */
let idiomaInicial = ""; try{ idiomaInicial = localStorage.getItem("idioma") || ""; }catch(e){}
if(!IDIOMAS[idiomaInicial]){ const n = (navigator.language || "pt").slice(0,2).toLowerCase(); idiomaInicial = IDIOMAS[n] ? n : "pt"; }
$("#idiomaBandeira").innerHTML = BANDEIRAS.pt;
if(idiomaInicial !== "pt") setLang(idiomaInicial, false); else { montarPriv(); atualizarPausa(); ajustarNav(); }
rota();
/* menu disponível sem rede: guarda uma cópia do site depois da primeira visita (precisa do ficheiro sw.js ao lado do index.html) */
if("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) addEventListener("load", () => { navigator.serviceWorker.register("/sw.js").catch(() => {}); });
atualizarJSONLD(); montarPedido();

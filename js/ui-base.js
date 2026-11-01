/* ============================================================
   Base: botões "Ligar", idiomas (T, setLang, mudarLang) e utilitários (js/ui-base.js)
   O funcionamento do site está dividido em ficheiros por tema (ui-base, ui-menu, ui-pedido, ui-pesquisa, ui-topo).
   Carregam por esta ordem e partilham as mesmas variáveis. Os dados estão em js/cafe.js, js/menu.js, js/idiomas.js e js/traducoes.js.
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
/* "reduzir movimento" do sistema: sem deslizes suaves nem animações */
const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
const SUAVE = reduz ? "auto" : "smooth";
const T = pt => { if(LANG === "pt") return pt; const e = DICT[pt]; return e ? (e[IDX[LANG]] || pt) : pt; };
/* as traduções (js/traducoes.js) só são descarregadas quando alguém escolhe outra língua que não o português */
const _VQ = document.currentScript && document.currentScript.src.includes("?") ? "?" + document.currentScript.src.split("?")[1] : "";
let _promTrad = null;
function carregarTraducoes(){
  if(Object.keys(DICT).length) return Promise.resolve();
  if(!_promTrad) _promTrad = new Promise((ok, falhou) => {
    const s = document.createElement("script"); s.src = "/js/traducoes.js" + _VQ;
    s.onload = ok; s.onerror = () => { _promTrad = null; s.remove(); falhou(new Error("traducoes")); };
    document.head.appendChild(s);
  });
  return _promTrad;
}
/* muda de língua, descarregando antes as traduções se for preciso (se falhar, o site fica em português) */
const mudarLang = (l, guardar = true) => l === "pt" ? setLang(l, guardar) : carregarTraducoes().then(() => setLang(l, guardar), () => {});
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
/* preço em "chip": euros grandes, cêntimos e € pequenos (texto completo escondido para os leitores de ecrã) */
function precoPartes(n){
  const [i, d] = n.toFixed(2).split(".");
  return LANG === "en" ? `<span class="pe">€</span><span class="pi">${i}</span><sup class="pd">${d}</sup>` : `<span class="pi">${i}</span><sup class="pd">${d}</sup><span class="pe">€</span>`;
}
const chipPreco = n => n > 0 ? `<span class="preco-chip"><span class="sr-so">${euro(n)}</span><span aria-hidden="true" class="pp">${precoPartes(n)}</span></span>` : `<span class="preco-chip preco-chip--vazio">${T("Preço a confirmar")}</span>`;
const euro = n => LANG === "en" ? "€" + n.toFixed(2) : n.toFixed(2).replace(".", ",") + " €";
const $ = s => document.querySelector(s);
const slug = t => t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
/* clique normal: abre o prato sem recarregar; com Ctrl, Shift ou Cmd deixa o navegador abrir o link noutro separador */
const cliqueSimples = e => !(e.ctrlKey || e.metaKey || e.shiftKey || e.altKey);

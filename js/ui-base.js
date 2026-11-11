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
const hh = h => { const m = minutos(h) % 1440; h = String(Math.floor(m/60)).padStart(2,"0") + ":" + String(m%60).padStart(2,"0"); return LANG === "pt" ? h.replace(":","h") : h; };
const fmt = (tpl, o) => tpl.replace("{h}", o.h || "").replace("{d}", o.d || "");
/* intervalos de abertura de um dia concreto, já com feriados e dias de fecho (tab = HORARIO do café ou COZINHA das refeições) */
function intervalosDoDia(d, tab = HORARIO){
  const mmdd = chaveData(d);
  const p = pascoa(d.getFullYear());   // domingo de Páscoa: fechado
  if(DIAS_FECHADOS.includes(d.getFullYear() + "-" + mmdd) || DIAS_FECHADOS.includes(mmdd) || mmdd === chaveData(p)) return [];
  return eFeriado(d) ? [[FERIADO.abreApartir, FERIADO.fechaAs]] : (tab[d.getDay()] || []);
}
/* está aberto agora? Conta também o que vem do dia anterior depois da meia-noite (ex.: sexta 07:00–26:00 vale até às 2h de sábado). Devolve a hora de fecho ou null */
function fechoAtual(d, tab){
  const m = d.getHours()*60 + d.getMinutes(), ontem = new Date(d.getFullYear(), d.getMonth(), d.getDate()-1);
  for(const [a,b] of intervalosDoDia(d, tab)) if(m >= minutos(a) && m < minutos(b)) return b;
  for(const [a,b] of intervalosDoDia(ontem, tab)) if(minutos(b) > 1440 && m + 1440 < minutos(b)) return b;
  return null;
}
function estadoAbertura(d = agoraLisboa()){
  const L = L_TXT[LANG], m = d.getHours()*60 + d.getMinutes(), fecho = fechoAtual(d, HORARIO);
  if(fecho) return {aberto:true, texto:fmt(L.aberto,{h:hh(fecho)})};
  for(let k=0;k<9;k++){
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate()+k);
    for(const [a] of intervalosDoDia(dd)) if(k>0 || minutos(a) > m)
      return {aberto:false, texto:fmt(k===0 ? L.hoje : k===1 ? L.amanha : L.dia, {h:hh(a), d:DIAS[LANG][dd.getDay()]})};
  }
  return {aberto:false, texto:L.fechado};
}
/* nota sobre as refeições enquanto o café está aberto: "Refeições até às 15h" / "Refeições a partir das 18h" */
function estadoRefeicoes(d = agoraLisboa()){
  const L = L_TXT[LANG], m = d.getHours()*60 + d.getMinutes(), fecho = fechoAtual(d, COZINHA);
  if(fecho) return fmt(L.cozA, {h:hh(fecho)});
  const proximo = intervalosDoDia(d, COZINHA).find(([a]) => minutos(a) > m);
  if(proximo) return fmt(L.cozF, {h:hh(proximo[0])});
  const amanha = intervalosDoDia(new Date(d.getFullYear(), d.getMonth(), d.getDate()+1), COZINHA)[0];
  return amanha ? fmt(L.cozM, {h:hh(amanha[0])}) : "";
}
/* linhas do horário agrupadas por dias iguais: [{ini, fim, dias, linhas:[[etiqueta, "07h–00h"], ...]}]. Se café e refeições coincidem, fica uma linha só */
function gruposHorario(sep){
  const L = L_TXT[LANG], fx = tab => (tab||[]).map(([a,b]) => `${hh(a)}–${hh(b)}`).join(sep) || L.fechado, grupos = [];
  [1,2,3,4,5,6,0].forEach(dia => {
    const caf = fx(HORARIO[dia]), coz = fx(COZINHA[dia]), chave = caf + "|" + coz, g = grupos[grupos.length-1];
    if(g && g.chave === chave){ g.fim = dia; g.dias.push(dia); }
    else grupos.push({ini:dia, fim:dia, dias:[dia], chave, linhas: caf === coz ? [["", caf]] : [[L.caf, caf], [L.coz, coz]]});
  });
  return grupos;
}
function horarioTexto(){
  const L = L_TXT[LANG], D = DIAS[LANG], fer = fmt(L.fer, {h:`${hh(FERIADO.abreApartir)} – ${hh(FERIADO.fechaAs)}`});
  return gruposHorario(L.e).map(g => `${D[g.ini]}${g.ini!==g.fim?L.a+D[g.fim]:""}: ` + g.linhas.map(([et,t]) => (et ? et + " " : "") + t.replace(/–/g," – ")).join(" · ")).join("<br>") + "<br>" + fer + "<br>" + L.fec
    + (MENU_ATE ? "<br>" + fmt(L.menu, {h:hh(MENU_ATE)}) : "");
}
/* horário em tabela (secção "Visita-nos"): o dia de hoje fica destacado */
function montarHorario(){
  const tab = $("#horarioTab"); if(!tab) return;
  const L = L_TXT[LANG], D = DIAS[LANG], agora = agoraLisboa(), hoje = agora.getDay();
  /* que linha vale hoje: a do dia da semana, a dos feriados, ou nenhuma (dia de fecho, ex.: 25 de dezembro) */
  const diaFecho = !intervalosDoDia(agora).length && (HORARIO[hoje] || []).length, feriadoHoje = !diaFecho && eFeriado(agora);
  const marca = (e) => e ? ` class="hoje"` : "", etiqueta = (e) => e ? ` <small class="hoje-tag">${T("Hoje")}</small>` : "";
  const fer = fmt(L.fer, {h:`${hh(FERIADO.abreApartir)}–${hh(FERIADO.fechaAs)}`}), i = fer.indexOf(":");
  tab.innerHTML = gruposHorario(" · ").map(g => { const e = g.dias.includes(hoje) && !diaFecho && !feriadoHoje; return `<div${marca(e)}><dt>${D[g.ini]}${g.ini !== g.fim ? L.a + D[g.fim] : ""}${etiqueta(e)}</dt><b></b><dd>${g.linhas.map(([et,t]) => et ? `<span><em>${et}</em> ${t}</span>` : `<span>${t}</span>`).join("")}</dd></div>`; }).join("")
    + `<div${marca(feriadoHoje)}><dt>${fer.slice(0,i)}${etiqueta(feriadoHoje)}</dt><b></b><dd><span>${fer.slice(i+1).trim()}</span></dd></div>`;
  $("#horarioFecho").textContent = L.fec + ".";
  const nm = $("#horarioMenu"); if(nm){ nm.textContent = MENU_ATE ? fmt(L.menu, {h:hh(MENU_ATE)}) : ""; nm.hidden = !MENU_ATE; }
}
function atualizarEstado(){
  const e = estadoAbertura(), est = $("#estado");
  est.className = "estado" + (e.aberto ? " aberto" : "");
  est.textContent = e.texto;
  /* café aberto mas cozinha fechada (ex.: 16h ou 00h30): diz quando há refeições, para ninguém ligar a pedir uma francesinha fora de horas */
  const agora = agoraLisboa(), cozFecho = fechoAtual(agora, COZINHA);
  const coz = e.aberto && cozFecho !== fechoAtual(agora, HORARIO) ? estadoRefeicoes(agora) : "";   // se a cozinha fecha à mesma hora que o café, não há nada a acrescentar
  if(coz){ const s = document.createElement("span"); s.className = "estado-coz"; s.innerHTML = `<span class="sr-so">. </span>`; s.append(coz); est.append(s); }
  montarHorario();
}

/* ============ UTILITÁRIOS ============ */
/* preço em "chip": euros grandes, cêntimos e € pequenos (texto completo escondido para os leitores de ecrã) */
function precoPartes(n){
  const [i, d] = n.toFixed(2).split(".");
  return LANG === "en" ? `<span class="pe">€</span><span class="pi">${i}</span><sup class="pd">${d}</sup>` : `<span class="pi">${i}</span><sup class="pd">${d}</sup><span class="pe">€</span>`;
}
const chipPreco = n => n > 0 ? `<span class="preco-chip"><span class="sr-so">${euro(n)}</span><span aria-hidden="true" class="pp">${precoPartes(n)}</span></span>` : `<span class="preco-chip preco-chip--vazio">${T("Preço a confirmar")}</span>`;
/* preço nos cartões do menu: logo por baixo do nome, sempre no mesmo sítio */
const precoCartao = n => n > 0 ? `<div class="card-preco"><span class="sr-so">${euro(n)}</span><span aria-hidden="true" class="pp">${precoPartes(n)}</span></div>` : `<div class="card-preco card-preco--vazio">${T("Preço a confirmar")}</div>`;
const euro = n => LANG === "en" ? "€" + n.toFixed(2) : n.toFixed(2).replace(".", ",") + " €";
const $ = s => document.querySelector(s);
const slug = t => t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
/* clique normal: abre o prato sem recarregar; com Ctrl, Shift ou Cmd deixa o navegador abrir o link noutro separador */
const cliqueSimples = e => !(e.ctrlKey || e.metaKey || e.shiftKey || e.altKey);

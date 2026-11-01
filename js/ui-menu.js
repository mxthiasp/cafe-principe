/* ============================================================
   Menu: separadores, arranque, sobre nós, mais pedidos, página de cada prato, prato do dia (js/ui-menu.js)
   O funcionamento do site está dividido em ficheiros por tema (ui-base, ui-menu, ui-pedido, ui-pesquisa, ui-topo).
   Carregam por esta ordem e partilham as mesmas variáveis. Os dados estão em js/cafe.js, js/menu.js, js/idiomas.js e js/traducoes.js.
   ============================================================ */
/* ============ 3. TABS DO MENU ============ */
const tabs = $("#tabs"), grelha = $("#grelha");

/* "Favorito da casa": coroa (do logótipo) + texto, alinhados ao centro */
const COROA = '<svg class="coroa" viewBox="0 0 24 20" aria-hidden="true" focusable="false"><path d="M1.5 4.5 7 9l5-7.5L17 9l5.5-4.5L20.4 16.5H3.6z" fill="currentColor"/><rect x="3.6" y="17.8" width="16.8" height="2.2" rx=".6" fill="currentColor"/></svg>';
const favorito = () => `<span class="favorito">${COROA}<span>${T("Favorito da casa")}</span></span>`;
function cartaoHTML(p, i){
  const nome = nomePrato(p);
  return `
    <div class="card-wrap" style="--i:${i}"><a class="card novo" style="--i:${i}" href="${urlPrato(p.nome)}" data-nome="${p.nome}">
      ${p.foto ? `<div class="foto"><img src="${p.foto}" alt="${nome}" loading="lazy" decoding="async">${chipPreco(p.preco)}</div>` : `<div class="foto foto--vazia">${chipPreco(p.preco)}</div>`}
      <h3>${nome}</h3>${p.destaque ? favorito() : ""}
      <p>${descPrato(p)}</p>
      <div class="card-fim">
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
  if(at) tabs.scrollTo({left: at.getBoundingClientRect().left - tabs.getBoundingClientRect().left + tabs.scrollLeft - (tabs.clientWidth - at.offsetWidth)/2, behavior:SUAVE});
  // os cartões entram do lado para onde se desliza (sem direção: de baixo)
  grelha.style.setProperty("--dx", dir * 46 + "px"); grelha.style.setProperty("--dy", dir ? "0px" : "24px");
  // Redesenha os cartões (a classe "novo" dispara a animação)
  grelha.innerHTML = MENU[cat].map(cartaoHTML).join("");
}

Object.keys(MENU).forEach(cat => {
  const b = document.createElement("button");
  b.className = "tab"; b.id = "tab-" + slug(cat); b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "grelha"); b.dataset.cat = cat; b.textContent = nomeCat(cat);
  b.onclick = () => { if(tabs.dataset.moveu === "1") return; const cats = Object.keys(MENU); mostrarCategoria(cat, Math.sign(cats.indexOf(cat) - cats.indexOf(catAtual)));  
    // Só reposiciona se os cartões ficaram escondidos atrás da barra fixa: assim a página não salta para o topo das categorias
    const folga = $("#barraTabs").getBoundingClientRect().bottom + 12, topo = grelha.getBoundingClientRect().top;
    if(topo < folga) scrollBy({top: topo - folga, behavior:SUAVE});
  };
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
    alvo.scrollIntoView({behavior:SUAVE, block:"center"});
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
      ${p.foto ? `<div class="foto"><img src="${p.foto}" alt="${nome}" loading="lazy" decoding="async">${chipPreco(p.preco)}</div>` : `<div class="foto foto--vazia">${chipPreco(p.preco)}</div>`}
      <h3>${nome}</h3>
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

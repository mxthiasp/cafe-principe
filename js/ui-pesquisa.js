/* ============================================================
   Pesquisa no menu, menu deslizante e animações (js/ui-pesquisa.js)
   O funcionamento do site está dividido em ficheiros por tema (ui-base, ui-menu, ui-pedido, ui-pesquisa, ui-topo).
   Carregam por esta ordem e partilham as mesmas variáveis. Os dados estão em js/cafe.js, js/menu.js, js/idiomas.js e js/traducoes.js.
   ============================================================ */
/* ============ PESQUISA NO MENU ============ */
const norm = t => (t || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
/* "Quiseste dizer…?": se alguma palavra não existir no menu, procura a mais parecida (tolera 1 erro em palavras de 4–6 letras e 2 em palavras maiores, incluindo letras trocadas) */
const distancia = (a, b) => {
  const m = a.length, n = b.length, d = Array.from({length:m+1}, (_, i) => [i, ...Array(n).fill(0)]);
  for(let j = 1; j <= n; j++) d[0][j] = j;
  for(let i = 1; i <= m; i++) for(let j = 1; j <= n; j++){
    d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
    if(i > 1 && j > 1 && a[i-1] === b[j-2] && a[i-2] === b[j-1]) d[i][j] = Math.min(d[i][j], d[i-2][j-2] + 1);   // duas letras trocadas
  }
  return d[m][n];
};
let vocab = null, vocabLang = "";
function vocabulario(){   // palavras do menu no idioma atual: normalizada → forma com acentos
  if(vocab && vocabLang === LANG) return vocab;
  vocab = new Map(); vocabLang = LANG;
  PRATOS.forEach(x => [nomePrato(x.p), descPrato(x.p), nomeCat(x.cat)].join(" ").split(/[^\p{L}\p{N}]+/u).forEach(w => { const n = norm(w); if(n.length > 2 && !vocab.has(n)) vocab.set(n, w.toLowerCase()); }));
  return vocab;
}
function corrigir(tokens, orig){
  const V = vocabulario(); let mudou = false;
  const certo = tokens.map((t, i) => {
    if([...V.keys()].some(w => w.includes(t))) return {n:t, o:orig[i]};
    const lim = t.length < 4 ? 0 : t.length < 7 ? 1 : 2; if(!lim) return {n:t, o:orig[i]};
    let melhor = null, md = lim + 1;
    V.forEach((o, w) => { const d = Math.min(distancia(t, w), distancia(t, w.slice(0, t.length))); if(d < md || (d === md && melhor && w.length < melhor.n.length)){ md = d; melhor = {n:w, o}; } });
    if(melhor && md <= lim){ mudou = true; return melhor; }
    return {n:t, o:orig[i]};
  });
  return mudou ? certo : null;
}
function pesquisar(q){
  consulta = q.trim();
  const barra = $("#barraTabs"), info = $("#pesqInfo");
  $("#pesqLimpar").hidden = !consulta;
  if(!consulta){ barra.classList.remove("a-pesquisar"); info.textContent = ""; mostrarCategoria(catAtual || "Francesinhas"); return; }
  const tokens = norm(consulta).split(/\s+/).filter(Boolean);
  const procura = ts => PRATOS.filter(x => { const alvo = norm([nomePrato(x.p), descPrato(x.p), nomeCat(x.cat), x.p.nome, x.p.desc].join(" ")); return ts.every(t => alvo.includes(t)); });
  let res = procura(tokens), sugestao = "";
  if(!res.length){   // sem resultados: tenta corrigir erros de escrita
    const c = corrigir(tokens, consulta.split(/\s+/).filter(Boolean)), r2 = c && procura(c.map(x => x.n));
    if(r2 && r2.length){ res = r2; sugestao = c.map(x => x.o).join(" "); }
  }
  barra.classList.add("a-pesquisar"); tabs.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", "false"));
  grelha.style.setProperty("--dx", "0px"); grelha.style.setProperty("--dy", "24px");
  if(res.length) grelha.innerHTML = res.map((x,i) => cartaoHTML(x.p, i)).join("");
  else { grelha.innerHTML = ""; const m = document.createElement("p"); m.className = "sem-resultados"; m.textContent = T("Sem resultados para") + " “" + consulta + "”."; grelha.appendChild(m); }
  const n = res.length === 1 ? T("1 prato") : res.length ? T("{n} pratos").replace("{n}", res.length) : "";
  info.textContent = "";
  if(sugestao){   // "Quiseste dizer: francesinha?" — clicar aplica a correção
    info.append(T("Quiseste dizer") + " ");
    const b = document.createElement("button"); b.type = "button"; b.className = "pesq-sug"; b.textContent = sugestao;
    b.onclick = () => { $("#pesq").value = sugestao; pesquisar(sugestao); $("#pesq").focus(); };
    info.append(b, "? · " + n);
  } else info.textContent = n;
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
$("#setaEsq").onclick = () => tabs.scrollBy({left: -tabs.clientWidth * .7, behavior:SUAVE});
$("#setaDir").onclick = () => tabs.scrollBy({left:  tabs.clientWidth * .7, behavior:SUAVE});
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
const heroEl = document.querySelector(".hero");
/* título do topo: as palavras sobem uma a uma */
const h1 = heroEl.querySelector("h1");
function escreverTitulo(txt){
  h1.setAttribute("aria-label", txt.trim());
  h1.innerHTML = txt.trim().split(/\s+/).map((w,i) => `<span class="pal" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(" ");
}
escreverTitulo(h1.textContent);

/* ============ FOTOS: aparecem com um desvanecer suave quando carregam (em vez de "saltarem") ============ */
const fotoPronta = i => i.classList.add("ok");
document.addEventListener("load", e => { if(e.target.tagName === "IMG") fotoPronta(e.target); }, true);
document.addEventListener("error", e => { if(e.target.tagName === "IMG") fotoPronta(e.target); }, true);
document.querySelectorAll(".foto img, .prato-foto img").forEach(i => { if(i.complete) fotoPronta(i); });

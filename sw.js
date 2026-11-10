/* Café Príncipe: modo sem rede.
   Depois da primeira visita, o site abre mesmo sem internet.
   - Páginas (incluindo /prato/...): tenta a rede primeiro (para a pessoa ver sempre a versão mais recente) e, se a rede falhar ou demorar, usa a cópia guardada do início.
   - Código (js e css): tenta a rede primeiro, com a cópia guardada como reserva.
   - Fotos, ícones e letras: usa a cópia guardada e atualiza-a quando houver rede.
   O número em VERSAO é escrito sozinho por scripts/gerar-dados.py (muda sempre que o código muda). */
const VERSAO = "cafe-principe-5644468e";
const INICIO = new URL("/", self.location.origin).href;
const PRE = ["/", "/css/estilo.css", "/js/idiomas.js", "/js/traducoes.js", "/js/menu.js", "/js/cafe.js", "/js/ui-base.js", "/js/ui-menu.js", "/js/ui-pedido.js", "/js/ui-pesquisa.js", "/js/ui-topo.js", "/favicon.svg", "/apple-touch-icon.png", "/img/francesinha-especial.webp"].map(u => new URL(u, INICIO).href);

self.addEventListener("install", e => {
  // as fotos não são essenciais: se alguma falhar, a instalação continua
  e.waitUntil(caches.open(VERSAO).then(c => Promise.all(PRE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

/* rede com limite de tempo: se demorar, usa-se a cópia guardada, mas a resposta nova continua a ser guardada para a visita seguinte */
const comTempo = (pedido, ms) => new Promise((res, rej) => {
  setTimeout(() => rej(new Error("demorou")), ms);
  pedido.then(res, rej);
});
const guardar = (chave, r) => caches.open(VERSAO).then(ca => ca.put(chave, r));

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(req.mode === "navigate"){
    const rede = fetch(req).then(async r => { if(r.ok && url.pathname === "/") await guardar(INICIO, r.clone()); return r; });
    e.waitUntil(rede.catch(() => {}));
    e.respondWith(comTempo(rede, 4000).catch(() => caches.match(INICIO)));
    return;
  }
  /* vídeos: vão sempre à rede (são grandes e chegam por partes) */
  if(/\.(mp4|webm)$/i.test(url.pathname)) return;
  /* código (.js e .css): rede primeiro, para um preço ou texto novo aparecer logo; sem rede, usa a cópia guardada */
  if(url.origin === self.location.origin && /\.(js|css)$/.test(url.pathname)){
    const rede = fetch(req).then(async r => { if(r && r.ok) await guardar(req, r.clone()); return r; });
    e.waitUntil(rede.catch(() => {}));
    e.respondWith(comTempo(rede, 4000).catch(() => caches.match(req, {ignoreSearch: true})));
    return;
  }
  if(url.origin === self.location.origin){
    e.respondWith(
      caches.match(req).then(guardado => {
        const rede = fetch(req).then(r => { if(r && r.ok){ const c = r.clone(); caches.open(VERSAO).then(ca => ca.put(req, c)); } return r; }).catch(() => guardado);
        return guardado || rede;
      })
    );
  }
});

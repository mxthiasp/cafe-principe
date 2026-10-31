/* Café Príncipe: modo sem rede.
   Depois da primeira visita, o site abre mesmo sem internet.
   - Páginas (incluindo /prato/...): tenta a rede primeiro (para a pessoa ver sempre a versão mais recente) e, se a rede falhar ou demorar, usa a cópia guardada do início.
   - Código (js e css): tenta a rede primeiro, com a cópia guardada como reserva.
   - Fotos, ícones e letras: usa a cópia guardada e atualiza-a quando houver rede.
   Para forçar a atualização das cópias antigas, muda o número em VERSAO. */
const VERSAO = "cafe-principe-v5";
const INICIO = new URL("/", self.location.origin).href;
const PRE = ["/", "/css/estilo.css", "/js/traducoes.js", "/js/menu.js", "/js/cafe.js", "/js/app.js", "/favicon.svg", "/apple-touch-icon.png", "/img/francesinha-especial.webp"].map(u => new URL(u, INICIO).href);

self.addEventListener("install", e => {
  // as fotos não são essenciais: se alguma falhar, a instalação continua
  e.waitUntil(caches.open(VERSAO).then(c => Promise.all(PRE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const comTempo = (req, ms) => new Promise((res, rej) => {
  const t = setTimeout(() => rej(new Error("demorou")), ms);
  fetch(req).then(r => { clearTimeout(t); res(r); }, err => { clearTimeout(t); rej(err); });
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(req.mode === "navigate"){
    e.respondWith(
      comTempo(req, 4000)
        .then(r => { if(r.ok && url.pathname === "/"){ const c = r.clone(); caches.open(VERSAO).then(ca => ca.put(INICIO, c)); } return r; })
        .catch(() => caches.match(INICIO))
    );
    return;
  }
  /* código (.js e .css): rede primeiro, para um preço ou texto novo aparecer logo; sem rede, usa a cópia guardada */
  if(url.origin === self.location.origin && /\.(js|css)$/.test(url.pathname)){
    e.respondWith(comTempo(req, 4000).then(r => { if(r && r.ok){ const c = r.clone(); caches.open(VERSAO).then(ca => ca.put(req, c)); } return r; }).catch(() => caches.match(req)));
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

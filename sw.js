/* Café Príncipe: modo sem rede.
   Depois da primeira visita, o site abre mesmo sem internet.
   - Páginas (incluindo /prato/...): tenta a rede primeiro (para a pessoa ver sempre a versão mais recente) e, se a rede falhar ou demorar, usa a cópia guardada do início.
   - Ficheiros do próprio site (fotos, ícones) e letras do Google: usa a cópia guardada e atualiza-a quando houver rede.
   Para forçar a atualização das cópias antigas, muda o número em VERSAO. */
const VERSAO = "cafe-principe-v2";
const INICIO = new URL("/", self.location.origin).href;
const PRE = ["/", "/favicon.svg", "/apple-touch-icon.png", "/img/hero.webp", "/img/hero-francesinha-em-pao.webp", "/img/hero-cachorro-especial.webp", "/img/hero-cachorro-na-chapa.webp", "/img/francesinha-especial.webp"].map(u => new URL(u, INICIO).href);

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
  if(url.origin === self.location.origin || /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(
      caches.match(req).then(guardado => {
        const rede = fetch(req).then(r => { if(r && (r.ok || r.type === "opaque")){ const c = r.clone(); caches.open(VERSAO).then(ca => ca.put(req, c)); } return r; }).catch(() => guardado);
        return guardado || rede;
      })
    );
  }
});

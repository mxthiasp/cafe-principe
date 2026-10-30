/* Café Príncipe: modo sem rede.
   Depois da primeira visita, o site abre mesmo sem internet.
   - Páginas: tenta a rede primeiro (para a pessoa ver sempre a versão mais recente) e, se a rede falhar ou demorar, usa a cópia guardada.
   - Ficheiros do próprio site e letras do Google: usa a cópia guardada e atualiza-a quando houver rede.
   Para forçar a atualização das cópias antigas, muda o número em VERSAO. */
const VERSAO = "cafe-principe-v1";
const INICIO = new URL("./", self.registration.scope).href;
const PRE = [INICIO, new URL("favicon.svg", INICIO).href, new URL("apple-touch-icon.png", INICIO).href];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(PRE)).then(() => self.skipWaiting()));
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
        .then(r => { if(r.ok){ const c = r.clone(); caches.open(VERSAO).then(ca => ca.put(INICIO, c)); } return r; })
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

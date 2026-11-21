/* Path to Proficiency offline support: the app page loads from the network when it can and from this cache when it can't.
   The school server (/api) is never cached. */
const CACHE = "p2p-v2", SHELL = ["/", "/favicon.svg", "/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())) });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())) });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api") || u.pathname.startsWith("/.netlify")) return;
  const main = u.pathname === "/" || u.pathname === "/index.html";
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok && (main || SHELL.includes(u.pathname))) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(main ? "/" : e.request, copy)) } return r })
    .catch(() => caches.match(main ? "/" : e.request).then(r => r || Response.error())));
});

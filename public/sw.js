// Service worker mínimo: hace la app instalable y que abra sin conexión.
// Los datos viven en localStorage, así que offline funciona de verdad.

const CACHE = "divicuentas-v1";
const BASICOS = ["/", "/manifest.webmanifest", "/DiviCuentas_logo.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(BASICOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  // Navegación: intentamos red primero para tomar la última versión;
  // si no hay conexión, servimos lo cacheado.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put("/", copia));
          return res;
        })
        .catch(() => caches.match("/").then((r) => r ?? caches.match(req)))
    );
    return;
  }

  // Assets con hash en el nombre: caché primero, y refrescamos por detrás.
  e.respondWith(
    caches.match(req).then((cacheado) => {
      const red = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
          }
          return res;
        })
        .catch(() => cacheado);
      return cacheado ?? red;
    })
  );
});

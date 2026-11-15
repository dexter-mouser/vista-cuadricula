// Service worker: guarda la app para usarla sin conexión
const VERSION_CACHE = 'vista-cuadricula-v2';
const ARCHIVOS_APP = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'manifest.webmanifest',
  'img/vista.jpg',
  'icons/icono.svg',
  'icons/icono-192.png',
  'icons/icono-512.png',
  'icons/icono-maskable-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(VERSION_CACHE).then((cache) => cache.addAll(ARCHIVOS_APP)));
  self.skipWaiting();
});

// Borra cachés de versiones anteriores
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((nombres) => Promise.all(nombres.filter((nombre) => nombre !== VERSION_CACHE).map((nombre) => caches.delete(nombre))))
      .then(() => self.clients.claim()),
  );
});

// Primero la red (para ver cambios publicados); sin conexión, lo guardado
self.addEventListener('fetch', (evento) => {
  const { request } = evento;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  evento.respondWith(
    fetch(request)
      .then((respuesta) => {
        if (respuesta.ok) {
          const copia = respuesta.clone();
          caches.open(VERSION_CACHE).then((cache) => cache.put(request, copia));
        }
        return respuesta;
      })
      .catch(() => caches.match(request, { ignoreSearch: true })
        .then((guardada) => guardada ?? caches.match('./'))),
  );
});

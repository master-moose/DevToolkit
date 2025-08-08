const CACHE_NAME = 'devtoolkit-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './assets/css/styles.css',
  './assets/js/utils.js',
  './assets/js/app.js',
  './assets/js/tools.js',
  './assets/icons/favicon.svg'
];

// External assets to try caching after first use
const EXT_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/prettier@3.3.3/standalone.js',
  'https://cdn.jsdelivr.net/npm/prettier@3.3.3/plugins/babel.js',
  'https://cdn.jsdelivr.net/npm/prettier@3.3.3/plugins/estree.js',
  'https://cdn.jsdelivr.net/npm/prettier@3.3.3/plugins/html.js',
  'https://cdn.jsdelivr.net/npm/prettier@3.3.3/plugins/postcss.js',
  'https://cdn.jsdelivr.net/npm/prettier@3.3.3/plugins/typescript.js',
  'https://cdn.jsdelivr.net/npm/prettier@3.3.3/plugins/markdown.js',
  'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js',
  'https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          const clone = response.clone();
          const isExt = EXT_ASSETS.some((p) => url.href.startsWith(p) || url.href === p);
          const isSameOrigin = url.origin === location.origin;
          if (isSameOrigin || isExt) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});


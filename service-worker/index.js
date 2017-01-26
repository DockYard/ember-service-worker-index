import {
  INDEX_HTML_PATH,
  VERSION
} from 'ember-service-worker-index/service-worker/config';

const CACHE_KEY_PREFIX = 'esw-index';
const CACHE_NAME = `${CACHE_KEY_PREFIX}-${VERSION}`;

const INDEX_HTML_URL = new URL(INDEX_HTML_PATH, self.location).toString();

/*
 * Deletes all caches that start with the `CACHE_KEY_PREFIX`, except for the
 * cache defined by `CACHE_NAME`
 */
const DELETE_STALE_CACHES = () => {
  return caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      let isIndexCache = cacheName.indexOf(CACHE_KEY_PREFIX) === 0;
      let isNotCurrentCache = cacheName !== CACHE_NAME;

      if (isIndexCache && isNotCurrentCache) {
        caches.delete(cacheName);
      }
    });
  });
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    fetch(INDEX_HTML_URL, { credentials: 'include' }).then((response) => {
      return caches
        .open(CACHE_NAME)
        .then((cache) => cache.put(INDEX_HTML_URL, response));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(DELETE_STALE_CACHES());
});

self.addEventListener('fetch', (event) => {
  let request = event.request;
  let isGETRequest = request.method === 'GET';
  let isHTMLRequest = request.headers.get('accept').indexOf('text/html') !== -1;
  let isLocal = new URL(request.url).origin === location.origin

  if (isGETRequest && isHTMLRequest && isLocal) {
    event.respondWith(
      caches.match(INDEX_HTML_URL, { cacheName: CACHE_NAME })
    );
  }
});

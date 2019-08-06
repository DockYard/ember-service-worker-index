import {
  INDEX_HTML_PATH,
  VERSION,
  INDEX_EXCLUDE_SCOPE,
  INDEX_INCLUDE_SCOPE,
  INDEX_FALLBACK
} from 'ember-service-worker-index/service-worker/config';

import { urlMatchesAnyPattern } from 'ember-service-worker/service-worker/url-utils';
import cleanupCaches from 'ember-service-worker/service-worker/cleanup-caches';

const CACHE_KEY_PREFIX = 'esw-index';
const CACHE_NAME = `${CACHE_KEY_PREFIX}-${VERSION}`;

const INDEX_HTML_URL = new URL(INDEX_HTML_PATH, self.location).toString();

const _fetchIndex = function() {
  return fetch(INDEX_HTML_URL, { credentials: 'include' }).then((response) => {
    return caches
      .open(CACHE_NAME)
      .then((cache) => cache.put(INDEX_HTML_URL, response));
  });
};

const _returnCachedIndex = function() {
  return caches.match(INDEX_HTML_URL, { cacheName: CACHE_NAME });
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    this._fetchIndex()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(cleanupCaches(CACHE_KEY_PREFIX, CACHE_NAME));
});

self.addEventListener('fetch', (event) => {
  let request = event.request;
  let isGETRequest = request.method === 'GET';
  let isHTMLRequest = request.headers.get('accept').indexOf('text/html') !== -1;
  let isLocal = new URL(request.url).origin === location.origin;
  let scopeExcluded = urlMatchesAnyPattern(request.url, INDEX_EXCLUDE_SCOPE);
  let scopeIncluded = !INDEX_INCLUDE_SCOPE.length || urlMatchesAnyPattern(request.url, INDEX_INCLUDE_SCOPE);

  if (isGETRequest && isHTMLRequest && isLocal && scopeIncluded && !scopeExcluded) {
    if (INDEX_FALLBACK) {
      event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
          return this._fetchIndex()
            .catch(() => this._returnCachedIndex());
        })
      );
    } else {
      return this._returnCachedIndex();
    }
  }
});

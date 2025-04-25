import {
  INDEX_HTML_PATH,
  ENVIRONMENT,
  VERSION,
  INDEX_EXCLUDE_SCOPE,
  INDEX_INCLUDE_SCOPE,
  STRATEGY,
  TIMEOUT
} from 'ember-service-worker-index/service-worker/config';

import { urlMatchesAnyPattern } from 'ember-service-worker/service-worker/url-utils';
import cleanupCaches from 'ember-service-worker/service-worker/cleanup-caches';

const CACHE_KEY_PREFIX = 'esw-index';
const CACHE_NAME = `${CACHE_KEY_PREFIX}-${VERSION}`;

const INDEX_HTML_URL = new URL(INDEX_HTML_PATH, self.location).toString();

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const response = await fetch(INDEX_HTML_URL, { credentials: 'include' });
      const cache = await caches.open(CACHE_NAME);
      await cache.put(INDEX_HTML_URL, response);
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(cleanupCaches(CACHE_KEY_PREFIX, CACHE_NAME));
});

self.addEventListener('fetch', (event) => {
  let request = event.request;
  let url = new URL(request.url);
  let isGETRequest = request.method === 'GET';
  let acceptHeader = request.headers !== null ? request.headers.get('accept') : null;
  let isHTMLRequest = acceptHeader !== null ? acceptHeader.indexOf('text/html') !== -1 : true;
  let isLocal = url.origin === location.origin;
  let scopeExcluded = urlMatchesAnyPattern(request.url, INDEX_EXCLUDE_SCOPE);
  let scopeIncluded = !INDEX_INCLUDE_SCOPE.length || urlMatchesAnyPattern(request.url, INDEX_INCLUDE_SCOPE);
  let isTests = url.pathname === '/tests' && ENVIRONMENT === 'development';

  if (!isTests && isGETRequest && isHTMLRequest && isLocal && scopeIncluded && !scopeExcluded) {
    event.respondWith(handleFetch());
  }
});

async function handleFetch() {
  return STRATEGY === 'fallback'
    ? await cacheFallbackFetch(TIMEOUT)
    : await cacheFirstFetch();
}

async function cacheFirstFetch() {
  const response = await caches.match(INDEX_HTML_URL, { cacheName: CACHE_NAME });

  if (response) {
    return response;
  }

  // Re-fetch in case the cache has been cleared
  const fetchedResponse = await fetch(INDEX_HTML_URL, { credentials: 'include' });
  const cache = await caches.open(CACHE_NAME);
  cache.put(INDEX_HTML_URL, fetchedResponse.clone());

  return fetchedResponse;
}

async function cacheFallbackFetch(timeout) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Request timed out'));
    }, timeout);
  });

  try {
    const response = await Promise.race([
      fetch(INDEX_HTML_URL, { credentials: 'include' }),
      timeoutPromise
    ]);

    clearTimeout(timeoutId); // cleanup

    const cache = await caches.open(CACHE_NAME);
    await cache.put(INDEX_HTML_URL, response.clone());

    return response;
  } catch (error) {
    return cacheFirstFetch();
  }
}

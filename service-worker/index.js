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
    fetch(INDEX_HTML_URL, { credentials: 'include' }).then((response) => {
      return caches
        .open(CACHE_NAME)
        .then((cache) => cache.put(INDEX_HTML_URL, response));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(cleanupCaches(CACHE_KEY_PREFIX, CACHE_NAME));
});

self.addEventListener('fetch', (event) => {
  let request = event.request;
  let url = new URL(request.url);
  let isGETRequest = request.method === 'GET';
  let isHTMLRequest = request.headers.get('accept').indexOf('text/html') !== -1;
  let isLocal = url.origin === location.origin;
  let scopeExcluded = urlMatchesAnyPattern(request.url, INDEX_EXCLUDE_SCOPE);
  let scopeIncluded = !INDEX_INCLUDE_SCOPE.length || urlMatchesAnyPattern(request.url, INDEX_INCLUDE_SCOPE);
  let isTests = url.pathname === '/tests' && ENVIRONMENT === 'development';
  if (!isTests && isGETRequest && isHTMLRequest && isLocal && scopeIncluded && !scopeExcluded) {
    if (STRATEGY === 'fallback') {
      cacheFallbackFetch(event, TIMEOUT);
    }
    else {
      return cacheFirstFetch(event);
    }
  }
});

function cacheFirstFetch(event) {
  return event.respondWith(
    caches.match(INDEX_HTML_URL, { cacheName: CACHE_NAME })
      .then((response) => {
        if (response) {
          return response;
        }

        /**
          Re-fetch the resource in the event that the cache had been cleared
          (mostly an issue with Safari 11.1 where clearing the cache causes
          the browser to throw a non-descriptive blank error page).
        */
        return fetch(INDEX_HTML_URL, { credentials: 'include' })
          .then((fetchedResponse) => {
            caches.open(CACHE_NAME).then((cache) => cache.put(INDEX_HTML_URL, fetchedResponse));
            return fetchedResponse.clone();
          });
      })
  );
}

function cacheFallbackFetch(event, fetchTimeout) {
  const FETCH_TIMEOUT = fetchTimeout;
  let didTimeOut = false;
  new Promise(function(_resolve, reject) {
    const timeout = setTimeout(function() {
      didTimeOut = true;
      reject(new Error('Request timed out'));
    }, FETCH_TIMEOUT);

    return fetch(INDEX_HTML_URL, { credentials: 'include' })
    .then(function(response) {
      /**
        Clear the timeout as cleanup
      */
      clearTimeout(timeout);
      if(!didTimeOut) {
        caches.open(CACHE_NAME).then((cache) => cache.put(INDEX_HTML_URL, response));
        return response.clone();
      }
    })
    .catch(function(err) {
      reject(err);
    });
  })
  .catch(function(err) {
    /**
      Rejection already happened with setTimeout
    */
    if(didTimeOut) {
      return cacheFirstFetch();
    }
  });
}

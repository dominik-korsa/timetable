function getCache(): Promise<Cache> {
  return caches.open('timetable-caches');
}

function assertOk<T extends Response>(response: T): T {
  if (!response.ok) throw new Error(`Fetch request failed with code ${response.status}`);
  return response;
}

export async function fetchWithErrors(input: RequestInfo, init?: RequestInit) {
  return assertOk(await fetch(input, init));
}

/*
Make request and if successful store and return its response,
otherwise throw error
 */
async function fetchNetworkOnly(
  input: RequestInfo,
  cacheInput: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const cache = await getCache();
  const response = assertOk(await fetch(input, init));
  await cache.put(cacheInput, response.clone());
  return response;
}

/*
Make request and if successful store and return its response,
otherwise return cache
 */
async function fetchNetworkFirst(
  input: RequestInfo,
  cacheInput: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const cache = await getCache();
  try {
    return fetchNetworkOnly(input, cacheInput, init);
  } catch (error) {
    const match = await cache.match(cacheInput);
    if (!match) throw error;
    return match;
  }
}

/*
Return cache if available,
otherwise make new request, cache its response and return it
 */
async function fetchCacheFirst(
  input: RequestInfo,
  cacheInput: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const cache = await getCache();

  const match = await cache.match(cacheInput);
  if (match) return match;

  return fetchNetworkOnly(input, cacheInput, init);
}

/*
Return cache if available,
then make new request and cache its response
(return if cache was not available)
 */
async function fetchLazyUpdate(
  input: RequestInfo,
  cacheInput: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const cache = await getCache();

  const match = await cache.match(cacheInput);
  const responsePromise = fetch(input, init)
    .then(assertOk)
    .then(async (response) => {
      await cache.put(cacheInput, response.clone());
      return response;
    });
  if (match) {
    responsePromise.catch((error) => console.warn('Failed to lazy update cache', error));
    return match;
  }
  return responsePromise;
}

export class NotInCacheError extends Error {
  name = 'NotInCacheError';

  message = 'Cache for this request was not found';
}

async function fetchCacheOnly(cacheInput: RequestInfo): Promise<Response> {
  const cache = await getCache();
  const match = await cache.match(cacheInput);
  if (!match) throw new NotInCacheError();
  return match;
}

export enum CacheMode {
  NetworkOnly,
  NetworkFirst,
  CacheFirst,
  LazyUpdate,
  CacheOnly,
}

export function fetchWithCache(
  mode: CacheMode,
  input: RequestInfo,
  init?: RequestInit,
  cacheInput: RequestInfo = input,
): Promise<Response> {
  switch (mode) {
    case CacheMode.NetworkOnly:
      return fetchNetworkOnly(input, cacheInput, init);
    case CacheMode.NetworkFirst:
      return fetchNetworkFirst(input, cacheInput, init);
    case CacheMode.CacheFirst:
      return fetchCacheFirst(input, cacheInput, init);
    case CacheMode.LazyUpdate:
      return fetchLazyUpdate(input, cacheInput, init);
    case CacheMode.CacheOnly:
      return fetchCacheOnly(cacheInput);
  }
}

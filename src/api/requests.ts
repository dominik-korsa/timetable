function getCache(): Promise<Cache> {
  return caches.open('timetable-caches');
}

function assertOk<T extends Response>(response: T): T {
  if (!response.ok) throw new Error(`Fetch request failed with code ${response.status}`);
  return response;
}

/*
Make request and if successful store and return its response,
otherwise return cache
 */
async function fetchNetworkFirst(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const cache = await getCache();
  try {
    const response = assertOk(await fetch(input, init));
    await cache.put(input, response.clone());
    return response;
  } catch (error) {
    const match = await cache.match(input);
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
  init?: RequestInit,
): Promise<Response> {
  const cache = await getCache();

  const match = await cache.match(input);
  if (match) return match;

  const response = assertOk(await fetch(input, init));
  await cache.put(input, response.clone());
  return response;
}

/*
Return cache if available,
then make new request and cache its response
(return if cache was not available)
 */
async function fetchLazyUpdate(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const cache = await getCache();

  const match = await cache.match(input);
  const responsePromise = fetch(input, init)
    .then(assertOk)
    .then(async (response) => {
      await cache.put(input, response.clone());
      return response;
    });
  if (match) {
    responsePromise.catch(console.error);
    return match;
  }
  return responsePromise;
}

export enum CacheMode {
  NetworkFirst,
  CacheFirst,
  LazyUpdate,
}

export function fetchWithCache(
  mode: CacheMode,
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  switch (mode) {
    case CacheMode.NetworkFirst:
      return fetchNetworkFirst(input, init);
    case CacheMode.CacheFirst:
      return fetchCacheFirst(input, init);
    case CacheMode.LazyUpdate:
      return fetchLazyUpdate(input, init);
  }
}

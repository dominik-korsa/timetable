function getCache(): Promise<Cache> {
  return caches.open('timetable-caches');
}

function assertOk<T extends Response>(response: T): T {
  if (!response.ok) throw new Error(`Fetch request failed with code ${response.status}`);
  return response;
}

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

export enum CacheMode {
  NetworkFirst,
  CacheFirst,
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
  }
}

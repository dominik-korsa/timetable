import { Timetable } from '@wulkanowy/timetable-parser';
import { CacheMode, fetchWithCache } from 'src/requests';

function toProxiedUrl(url: URL | string): URL {
  return new URL(`/${url}`, process.env.PROXY_URL);
}

export interface OptivumTimetableInfo {
  title: string;
  baseUrl: string;
}

export async function loadOptivumTimetable(
  baseUrl: URL | string,
  cacheMode: CacheMode,
): Promise<OptivumTimetableInfo> {
  const response = await fetchWithCache(cacheMode, toProxiedUrl(baseUrl).toString());
  const timetable = new Timetable(await response.text());
  if (timetable.getListPath() === undefined) throw new Error('Invalid timetable format');
  return {
    title: timetable.getTitle(),
    baseUrl: response.headers.get('x-final-url') ?? baseUrl.toString(),
  };
}

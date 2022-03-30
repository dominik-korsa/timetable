import { ListItem, Timetable, TimetableList } from '@wulkanowy/timetable-parser';
import { CacheMode, fetchWithCache } from 'src/api/requests';

function toProxiedUrl(url: URL | string): URL {
  return new URL(`/${url}`, process.env.PROXY_URL);
}

export interface OptivumTimetableInfo {
  title: string;
  baseUrl: string;
  listPath: string;
}

export async function loadOptivumTimetable(
  baseUrl: URL | string,
  cacheMode: CacheMode,
): Promise<OptivumTimetableInfo> {
  const response = await fetchWithCache(cacheMode, toProxiedUrl(baseUrl).toString());
  const timetable = new Timetable(await response.text());
  const listPath = timetable.getListPath();
  if (listPath === undefined) throw new Error('Invalid timetable format');
  return {
    title: timetable.getTitle(),
    baseUrl: response.headers.get('x-final-url') ?? baseUrl.toString(),
    listPath,
  };
}

export async function loadOptivumClassList(
  timetableInfo: OptivumTimetableInfo,
  cacheMode: CacheMode,
): Promise<ListItem[]> {
  const listUrl = new URL(timetableInfo.listPath, timetableInfo.baseUrl);
  const response = await fetchWithCache(cacheMode, toProxiedUrl(listUrl).toString());
  const timetableList = new TimetableList(await response.text());
  return timetableList.getList().classes;
}

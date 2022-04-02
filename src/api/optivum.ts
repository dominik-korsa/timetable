import {
  ListItem, Table, Timetable, TimetableList,
} from '@wulkanowy/timetable-parser';
import { CacheMode, fetchWithCache } from 'src/api/requests';
import { TableData, toUmid } from 'src/api/common';

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

export async function loadOptivumTable(
  baseUrl: URL | string,
  classValue: string,
  cacheMode: CacheMode,
): Promise<TableData> {
  const tableUrl = new URL(`plany/o${classValue}.html`, baseUrl);
  const response = await fetchWithCache(cacheMode, toProxiedUrl(tableUrl).toString());
  const table = new Table(await response.text());

  return {
    className: table.getTitle(),
    hours: Object.values(table.getHours()).map(({ number, timeFrom, timeTo }) => ({
      display: number.toString(),
      begin: timeFrom,
      end: timeTo,
    })),
    lessons: table.getDays().map((day, dayIndex) => day.map((moment, momentIndex) => ({
      umid: toUmid(baseUrl.toString(), classValue, dayIndex, momentIndex),
      lessons: moment.map((lesson) => ({
        subject: lesson.subject,
        subjectShort: lesson.subject,
        group: lesson.groupName,
        room: lesson.room,
        teacher: lesson.teacher,
        color: undefined,
      })),
    }))),
  };
}

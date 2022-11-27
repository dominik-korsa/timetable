import { Table, Timetable, TimetableList } from '@wulkanowy/timetable-parser';
import { CacheMode, fetchWithCache } from 'src/api/requests';
import {
  AllClassesLessons,
  TableDataWithHours,
  toProxiedUrl,
  toUmid,
  UnitType,
} from 'src/api/common';
import { bangEncode, randomColor } from 'src/utils';
import { BaseClient, ClassListItem } from 'src/api/client';

export interface OptivumTimetableInfo {
  title: string;
  baseUrl: string;
  listPath: string;
}

export class OptivumClient implements BaseClient {
  readonly baseUrl: string;

  readonly listPath: string;

  readonly tri: string;

  readonly key: string;

  readonly type = 'optivum';

  readonly supportsOffsets = false;

  static createTri(baseUrl: string, listPath: string) {
    const encodedListPath = bangEncode(listPath);
    if (baseUrl.startsWith('https://')) return `o,2,${bangEncode(baseUrl.substring(8))},${encodedListPath}`;
    if (baseUrl.startsWith('http://')) return `o,1,${bangEncode(baseUrl.substring(7))},${encodedListPath}`;
    return `o,0,${bangEncode(baseUrl)},${encodedListPath}`;
  }

  static async attemptLoad(
    cacheMode: CacheMode,
    initialBaseUrl: string,
  ): Promise<OptivumTimetableInfo> {
    const response = await fetchWithCache(cacheMode, toProxiedUrl(initialBaseUrl).toString());
    const timetable = new Timetable(await response.text());
    const listPath = timetable.getListPath();
    if (listPath === undefined) throw new Error('Invalid timetable format');
    return {
      title: timetable.getTitle(),
      baseUrl: response.headers.get('x-final-url') ?? initialBaseUrl.toString(),
      listPath,
    };
  }

  constructor(baseUrl: string, listPath: string) {
    this.baseUrl = baseUrl;
    this.listPath = listPath;
    this.tri = OptivumClient.createTri(baseUrl, listPath);
    this.key = `o,${baseUrl}`;
  }

  async getClassList(cacheMode: CacheMode): Promise<ClassListItem[]> {
    const listUrl = new URL(this.listPath, this.baseUrl);
    const response = await fetchWithCache(cacheMode, toProxiedUrl(listUrl).toString());
    const timetableList = new TimetableList(await response.text());
    return timetableList.getList().classes.map((item) => ({ name: item.name, unit: item.value }));
  }

  async getTitle(cacheMode: CacheMode): Promise<string> {
    const response = await fetchWithCache(cacheMode, toProxiedUrl(this.baseUrl).toString());
    const timetable = new Timetable(await response.text());
    return timetable.getTitle();
  }

  async getLessons(fromCache: boolean, unitType: UnitType, unit: string): Promise<TableDataWithHours> {
    if (unitType !== 'class') throw new Error('Not implemented');
    const tableUrl = new URL(`plany/o${unit}.html`, this.baseUrl);
    const response = await fetchWithCache(
      fromCache ? CacheMode.CacheOnly : CacheMode.NetworkOnly,
      toProxiedUrl(tableUrl).toString(),
    );
    const table = new Table(await response.text());

    return {
      unitName: table.getTitle(),
      unitType,
      unit,
      hours: Object.values(table.getHours()).map(({ number, timeFrom, timeTo }) => ({
        display: number.toString(),
        begin: timeFrom,
        end: timeTo,
      })),
      lessons: table.getDays().map((day, dayIndex) => day.map((moment, momentIndex) => ({
        umid: toUmid(this.key, unitType, unit, dayIndex, momentIndex),
        lessons: moment.map((lesson) => ({
          subject: lesson.subject,
          subjectShort: lesson.subject,
          group: lesson.groupName ? {
            name: lesson.groupName,
            short: lesson.groupName,
            key: lesson.groupName,
          } : undefined,
          room: lesson.room,
          teacher: lesson.teacher ? {
            name: lesson.teacher,
            short: lesson.teacher,
          } : undefined,
          color: randomColor(`${lesson.subject}|${lesson.teacher}`),
          removed: false,
        })),
      }))),
      headers: null,
    };
  }

  async getLessonsOfAllClasses(fromCache: boolean): Promise<AllClassesLessons> {
    throw new Error('Not implemented');
    // const classList = await this.getClassList(fromCache ? CacheMode.CacheOnly : CacheMode.NetworkFirst);
    // return Promise.all(
    //   classList.map((item) => this.getLessons(fromCache, 'class', item.unit)),
    // );
  }

  async getUnitNameMapper(cacheMode: CacheMode) {
    const classList = await this.getClassList(cacheMode);
    const classMap = Object.fromEntries(classList.map(({ name, unit }) => ([unit, name])));
    return (unitType: UnitType, unit: string) => {
      if (unitType !== 'class') return unit;
      return classMap[unit] ?? unit;
    };
  }
}

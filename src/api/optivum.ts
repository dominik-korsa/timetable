import { Table, Timetable, TimetableList } from '@wulkanowy/timetable-parser';
import { CacheMode, fetchWithCache } from 'src/api/requests';
import {
  AllClassesLessons,
  TableDataWithHours, TableHour, TableLessonMoment,
  toProxied,
  toUmid,
  UnitType,
} from 'src/api/common';
import {
  bangEncode, createArray, parseHour, randomColor,
} from 'src/utils';
import { BaseClient, ClassList } from 'src/api/client';

export interface OptivumTimetableInfo {
  title: string;
  baseUrl: string;
  listPath: string;
}

export interface OptivumClassList extends ClassList {
  logoSrc: string | null;
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
    const proxied = toProxied(initialBaseUrl);
    const response = await fetchWithCache(
      cacheMode,
      proxied.url.toString(),
      {
        headers: proxied.headers,
      },
    );
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

  async getClassList(cacheMode: CacheMode): Promise<OptivumClassList> {
    const listUrl = new URL(this.listPath, this.baseUrl);
    const proxied = toProxied(listUrl);
    const response = await fetchWithCache(
      cacheMode,
      proxied.url.toString(),
      {
        headers: proxied.headers,
      },
    );
    const timetableList = new TimetableList(await response.text());
    return {
      items: timetableList.getList().classes.map((item) => ({ name: item.name, unit: item.value })),
      logoSrc: timetableList.getLogoSrc(),
    };
  }

  async getTitle(cacheMode: CacheMode): Promise<string> {
    const proxied = toProxied(this.baseUrl);
    const response = await fetchWithCache(
      cacheMode,
      proxied.url.toString(),
      {
        headers: proxied.headers,
      },
    );
    const timetable = new Timetable(await response.text());
    return timetable.getTitle();
  }

  private static getTableUrl(unitType: UnitType, unit: string): string {
    return `plany/${{ class: 'o', room: 's', teacher: 'n' }[unitType]}${unit}.html`;
  }

  async getLessons(fromCache: boolean, unitType: UnitType, unit: string): Promise<TableDataWithHours> {
    const tableUrl = new URL(OptivumClient.getTableUrl(unitType, unit), this.baseUrl);
    const proxied = toProxied(tableUrl);
    const response = await fetchWithCache(
      fromCache ? CacheMode.CacheOnly : CacheMode.NetworkOnly,
      proxied.url.toString(),
      {
        headers: proxied.headers,
      },
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
      lessons: table.getDays().map((day, weekday) => day.map((moment, momentIndex) => ({
        umid: toUmid(this.key, unitType, unit, weekday, momentIndex),
        weekday,
        lessons: moment.map((lesson) => ({
          subject: lesson.subject,
          subjectShort: lesson.subject,
          group: lesson.groupName ? {
            name: lesson.groupName,
            key: lesson.groupName,
          } : undefined,
          room: lesson.room,
          roomId: undefined,
          teacher: lesson.teacher,
          color: randomColor(`${lesson.subject}|${lesson.teacher}`),
          removed: false,
        })),
      }))),
      headers: null,
    };
  }

  async getLessonsOfAllClasses(fromCache: boolean): Promise<AllClassesLessons> {
    const classList = await this.getClassList(fromCache ? CacheMode.CacheOnly : CacheMode.NetworkFirst);
    const tables = await Promise.all(
      classList.items.map(async (item) => this.getLessons(fromCache, 'class', item.unit)),
    );
    const getHourId = (hour: TableHour) => `${hour.begin}-${hour.end}`;
    const hoursMap: Record<string, TableHour> = {};
    tables.forEach((table) => {
      table.hours.forEach((hour) => {
        hoursMap[getHourId(hour)] = hour;
      });
    });
    const hours = Array.from(Object.values(hoursMap));
    hours.sort((lhs, rhs) => parseHour(lhs.begin) - parseHour(rhs.begin));
    const hourIndexes: Record<string, number> = {};
    hours.forEach((hour, index) => {
      hourIndexes[getHourId(hour)] = index;
    });
    return {
      hours,
      units: tables.map((unit) => ({
        ...unit,
        lessons: unit.lessons.map((day, weekday) => {
          const result = createArray<TableLessonMoment>(hours.length, (momentIndex) => ({
            lessons: [],
            umid: toUmid(this.key, unit.unitType, unit.unit, weekday, momentIndex),
            weekday,
          }));
          day.forEach((moment, index) => {
            result[hourIndexes[getHourId(unit.hours[index])]].lessons.push(...moment.lessons);
          });
          return result;
        }),
      })),
    };
  }

  async getUnitNameMapper(cacheMode: CacheMode) {
    const classList = await this.getClassList(cacheMode);
    const classMap = Object.fromEntries(classList.items.map(({ name, unit }) => ([unit, name])));
    return (unitType: UnitType, unit: string) => {
      if (unitType !== 'class') return unit;
      return classMap[unit] ?? unit;
    };
  }
}

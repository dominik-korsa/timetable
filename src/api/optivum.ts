import {
  ListItem,
  Table,
  TableLesson,
  Timetable,
  TimetableList,
} from '@wulkanowy/timetable-parser';
import { CacheMode, fetchWithCache } from 'src/api/requests';
import {
  AllClassesLessons,
  TableDataWithTimeSlots,
  TableTimeSlot, TableLessonClass,
  TableLessonMoment,
  toProxied,
  toUmid,
  UnitType,
} from 'src/api/common';
import {
  bangEncode, createArray, parseTimestamp, randomColor,
} from 'src/utils';
import { BaseClient, UnitListItem, UnitLists } from 'src/api/client';

export interface OptivumTimetableInfo {
  title: string;
  baseUrl: string;
  listPath: string;
}

export interface OptivumUnitLists extends UnitLists {
  logoSrc: string | null;
}

interface CombinedTableLesson extends Omit<TableLesson, 'className'> {
  classes: {
    name: string;
    id: string | undefined;
  }[];
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

  private static mapUnitListOptional(items: ListItem[] | undefined): UnitListItem[] | undefined {
    if (!items || items.length === 0) return undefined;
    return items.map((item) => ({
      name: item.name,
      unit: item.value,
    }));
  }

  async getUnitLists(cacheMode: CacheMode): Promise<OptivumUnitLists> {
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
    const { classes, rooms, teachers } = timetableList.getList();
    return {
      classes: classes.map((item) => ({
        name: OptivumClient.simplifyClassName(item.name),
        unit: item.value,
      })),
      rooms: OptivumClient.mapUnitListOptional(rooms),
      teachers: OptivumClient.mapUnitListOptional(teachers),
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

  static combineTableLessons(lessons: TableLesson[]): CombinedTableLesson[] {
    const groups = new Map<string, CombinedTableLesson>();
    lessons.forEach((lesson) => {
      const groupId = `${lesson.groupName ?? '#'}|${lesson.subject}|${lesson.teacher ?? '#'}|${lesson.room ?? '#'}`;
      let group = groups.get(groupId);
      if (!group) {
        group = {
          room: lesson.room,
          roomId: lesson.roomId,
          teacher: lesson.teacher,
          teacherId: lesson.teacherId,
          subject: lesson.subject,
          groupName: lesson.groupName,
          classes: [],
        };
        groups.set(groupId, group);
      }
      if (lesson.className !== undefined) {
        group.classes.push({
          name: lesson.className,
          id: lesson.classId,
        });
      }
    });
    return [...groups.values()];
  }

  static simplifyClassName(name: string) {
    return name.split(' ')[0] || name;
  }

  static simplifyClassObject({ name, id }: TableLessonClass) {
    return {
      name: OptivumClient.simplifyClassName(name),
      id,
    };
  }

  async getLessons(fromCache: boolean, unitType: UnitType, unit: string): Promise<TableDataWithTimeSlots> {
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
    const unitName = table.getTitle();
    return {
      unitName,
      unitType,
      unit,
      timeSlots: Object.values(table.getHours()).map(({ number, timeFrom, timeTo }) => ({
        display: number.toString(),
        begin: timeFrom,
        end: timeTo,
      })),
      lessons: table.getDays().map((day, weekday) => day.map((moment, momentIndex) => ({
        umid: toUmid(this.key, unitType, unit, weekday, momentIndex),
        weekday,
        lessons: OptivumClient.combineTableLessons(moment).map((lesson) => ({
          subject: lesson.subject,
          subjectShort: lesson.subject,
          group: lesson.groupName ? {
            name: lesson.groupName,
            key: lesson.groupName,
          } : undefined,
          room: unitType === 'room' ? unitName : lesson.room,
          roomId: lesson.roomId,
          classes: (
            lesson.classes.length === 0 && unitType === 'class' ? [{
              name: unitName,
              id: unit,
            }] : lesson.classes
          ).map(OptivumClient.simplifyClassObject),
          teacher: unitType === 'teacher' ? unitName : lesson.teacher,
          teacherId: lesson.teacherId,
          color: randomColor(`${lesson.subject}|${lesson.teacher}`),
          removed: false,
        })),
      }))),
      headers: null,
    };
  }

  async getLessonsOfAllClasses(fromCache: boolean): Promise<AllClassesLessons> {
    const { classes } = await this.getUnitLists(fromCache ? CacheMode.CacheOnly : CacheMode.NetworkFirst);
    const tables = await Promise.all(
      classes.map(async (item) => this.getLessons(fromCache, 'class', item.unit)),
    );
    const getTimeSlotId = (timeSlot: TableTimeSlot) => `${timeSlot.begin}-${timeSlot.end}`;
    const timeSlotMapp: Record<string, TableTimeSlot> = {};
    tables.forEach((table) => {
      table.timeSlots.forEach((timeSlot) => {
        timeSlotMapp[getTimeSlotId(timeSlot)] = timeSlot;
      });
    });
    const timeSlots = Array.from(Object.values(timeSlotMapp));
    timeSlots.sort(
      (lhs, rhs) => parseTimestamp(lhs.begin) - parseTimestamp(rhs.begin),
    );
    const timeSlotIndexes: Record<string, number> = {};
    timeSlots.forEach((timeSlot, index) => {
      timeSlotIndexes[getTimeSlotId(timeSlot)] = index;
    });
    return {
      timeSlots,
      units: tables.map((unit) => ({
        ...unit,
        unitName: OptivumClient.simplifyClassName(unit.unitName),
        lessons: unit.lessons.map((day, weekday) => {
          const result = createArray<TableLessonMoment>(timeSlots.length, (timeSlotIndex) => ({
            lessons: [],
            umid: toUmid(this.key, unit.unitType, unit.unit, weekday, timeSlotIndex),
            weekday,
          }));
          day.forEach((moment, index) => {
            result[timeSlotIndexes[getTimeSlotId(unit.timeSlots[index])]].lessons.push(...moment.lessons);
          });
          return result;
        }),
      })),
    };
  }

  async getUnitNameMapper(cacheMode: CacheMode) {
    const { classes, rooms, teachers } = await this.getUnitLists(cacheMode);
    const constructMap = (units: UnitListItem[] | undefined) => {
      if (!units) return {};
      return Object.fromEntries(units.map(({ name, unit }) => ([unit, name])));
    };
    const map = {
      class: constructMap(classes),
      room: constructMap(rooms),
      teacher: constructMap(teachers),
    };
    return (unitType: UnitType, unit: string) => map[unitType][unit] ?? unit;
  }
}

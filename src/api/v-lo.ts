import { CacheMode, fetchWithCache } from 'src/api/requests';
import {
  AllClassesLessons,
  Substitution, TableData,
  TableDataWithHours,
  TableHour,
  TableLessonMoment,
  toUmid,
  UnitType,
} from 'src/api/common';
import _ from 'lodash';
import { mondayOf } from 'src/date-utils';
import { Temporal } from '@js-temporal/polyfill';
import { BaseClient, UnitLists } from 'src/api/client';
import { roomRawToIdMap } from 'src/api/v-lo-rooms';

interface TimestampsResponseItem {
  begin: string;
  end: string;
  display: string;
}

interface LessonResponseItem {
  subject: string;
  subject_short: string;
  teacher: string;
  classroom: string;
  color: string;
  time_index: number;
  duration: number;
  group_raw: string;
  group: string;
  date: string;
  day_index: number;
  removed: boolean;
  raw: null;
}

interface LessonResponse {
  ttdata: LessonResponseItem[][][];
}

interface SubstitutionResponseItem {
  content: string;
  time: number | [number, number];

  type: 'cancellation' | string;
}

type SubstitutionResponse = SubstitutionResponseItem[];

const v1ApiOrigin = process.env.VLO_V1_API_ORIGIN ?? 'https://api.cld.sh';
const v2ApiOrigin = process.env.VLO_V2_API_ORIGIN ?? 'https://api.cld.sh';

export async function loadVLoHours(cacheMode: CacheMode): Promise<TableHour[]> {
  const response = await fetchWithCache(cacheMode, new URL('/v1/vlo/timestamps', v1ApiOrigin).toString());
  const body = await response.json() as TimestampsResponseItem[];
  return Object.entries(body).map(([index, { begin, end }]) => ({
    begin,
    end,
    display: index,
  }));
}

export class VLoClient implements BaseClient {
  readonly type = 'v-lo';

  readonly tri = 'v-lo';

  readonly key = 'v-lo';

  readonly supportsOffsets = true;

  async getUnitLists(cacheMode: CacheMode): Promise<UnitLists> {
    const response = await fetchWithCache(cacheMode, new URL('/v1/vlo/listclass', v1ApiOrigin).toString());
    const classes = await response.json() as string[];
    return {
      classes: classes.map((value) => ({
        unit: value,
        name: value,
      })),
    };
  }

  private async loadSubstitutions(
    cacheMode: CacheMode,
    unitType: UnitType,
    unit: string,
    date: Temporal.PlainDate,
  ): Promise<Substitution[]> {
    if (unitType !== 'class') throw new Error('Not implemented');
    const response = await fetchWithCache(
      cacheMode,
      new URL(
        `/v2/substitutions?classid=${encodeURIComponent(unit)}&date=${date.toString()}`,
        v2ApiOrigin,
      ).toString(),
      undefined,
    );
    const body = await response.json() as SubstitutionResponse;
    return body.map((item) => ({
      lessons: typeof item.time === 'number'
        ? { first: item.time, last: item.time }
        : { first: item.time[0], last: item.time[1] },
      info: item.content,
      cancelled: item.type === 'cancellation',
    }));
  }

  private async loadLessons(
    cacheMode: CacheMode,
    unitType: UnitType,
    unit: string,
    monday: Temporal.PlainDate,
  ): Promise<{
    date: Temporal.PlainDate,
    moments: TableLessonMoment[],
  }[]> {
    if (unitType !== 'class') throw new Error('Not implemented');
    const response = await fetchWithCache(
      cacheMode,
      new URL(`/v2/ttdata?classid=${encodeURIComponent(unit)}&date=${monday.toString()}`, v2ApiOrigin).toString(),
      undefined,
    );
    const body = await response.json() as LessonResponse;
    return body.ttdata.map((day, weekday) => {
      const moments: TableLessonMoment[] = [];
      let date = monday.add({ days: weekday });
      _.flatten(day).forEach((lesson) => {
        date = Temporal.PlainDate.from(lesson.date);
        while (moments.length < lesson.time_index + lesson.duration) {
          moments.push({
            umid: toUmid(this.key, unitType, unit, weekday, moments.length),
            weekday,
            date,
            lessons: [],
          });
        }
        for (let i = lesson.time_index; i < lesson.time_index + lesson.duration; i += 1) {
          moments[i].lessons.push({
            subject: lesson.subject,
            subjectShort: lesson.subject_short,
            teacher: lesson.teacher || undefined,
            teacherId: undefined,
            room: lesson.classroom || undefined,
            roomId: roomRawToIdMap[lesson.classroom],
            group: lesson.group_raw ? {
              key: lesson.group_raw,
              name: lesson.group,
            } : undefined,
            classes: [{
              name: unit,
              id: undefined,
            }],
            color: lesson.color,
            removed: lesson.removed ?? false,
          });
        }
      });
      return {
        moments,
        date,
      };
    });
  }

  private async getLessonsPartial(
    fromCache: boolean,
    unitType: UnitType,
    unit: string,
    offset: number,
  ): Promise<TableData> {
    const cacheMode = fromCache ? CacheMode.CacheOnly : CacheMode.NetworkOnly;
    const monday = mondayOf(Temporal.Now.plainDateISO()).add({ weeks: offset });
    const [days, substitutions] = await Promise.all([
      this.loadLessons(cacheMode, unitType, unit, monday),
      Promise.all([0, 1, 2, 3, 4].map((value) => this.loadSubstitutions(
        cacheMode,
        unitType,
        unit,
        monday.add({ days: value }),
      ))),
    ]);
    return {
      lessons: days.map((day) => day.moments),
      unitName: unit,
      unitType,
      unit,
      headers: days.map((day, dayIndex) => ({
        date: day.date,
        substitutions: substitutions[dayIndex],
      })),
    };
  }

  async getLessons(fromCache: boolean, unitType: UnitType, unit: string, offset: number): Promise<TableDataWithHours> {
    const [hours, partialData] = await Promise.all([
      loadVLoHours(fromCache ? CacheMode.CacheOnly : CacheMode.LazyUpdate),
      this.getLessonsPartial(fromCache, unitType, unit, offset),
    ]);
    return {
      ...partialData,
      hours,
    };
  }

  async getLessonsOfAllClasses(fromCache: boolean, offset: number): Promise<AllClassesLessons> {
    const { classes } = await this.getUnitLists(fromCache ? CacheMode.CacheOnly : CacheMode.NetworkFirst);
    const [hours, units] = await Promise.all([
      loadVLoHours(fromCache ? CacheMode.CacheOnly : CacheMode.LazyUpdate),
      Promise.all(classes.map((item) => this.getLessonsPartial(fromCache, 'class', item.unit, offset))),
    ]);
    return {
      hours,
      units,
    };
  }

  getUnitNameMapper = async () => (unitType: string, unitValue: string) => unitValue;

  getTitle = async () => 'V LO w Krakowie';
}

import { CacheMode, fetchWithCache } from 'src/api/requests';
import {
  AllClassesLessons,
  TableDataBase,
  TableDataWithHours,
  TableHour,
  TableLessonMoment,
  toProxiedUrl,
  toUmid,
  UnitType,
} from 'src/api/common';
import _ from 'lodash';
import { mondayOf } from 'src/date-utils';
import {
  getSubstitutionsBody,
  getSubstitutionsUrl,
  parseSubstitutions,
  Substitution,
} from '@wulkanowy/asc-timetable-parser';
import { Temporal } from '@js-temporal/polyfill';
import { BaseClient, ClassListItem } from 'src/api/client';
import { DefaultsMap } from 'src/utils';

interface TimestampsResponseItem {
  begin: string;
  end: string;
  display: string;
}

interface LessonResponseItem {
  subject: string;
  subject_short: string;
  teacher: {
    name: string;
    short: string;
  };
  classroom: string;
  color: string;
  time_index: number;
  duration: number;
  group: {
    name: string;
    raw: string;
    short: string;
  } | null;
  date: string;
  day_index: number;
  removed: boolean;
  raw: null;
}

interface LessonResponse {
  ttdata: LessonResponseItem[][][];
}

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

  async getClassList(cacheMode: CacheMode): Promise<ClassListItem[]> {
    const response = await fetchWithCache(cacheMode, new URL('/v1/vlo/listclass', v1ApiOrigin).toString());
    const classes = await response.json() as string[];
    return classes.map((value) => ({
      unit: value,
      name: value,
    }));
  }

  private static async loadVLoSubstitutions(
    cacheMode: CacheMode,
    date: Temporal.PlainDate,
  ): Promise<(classValue: string) => Substitution[]> {
    const url = new URL(getSubstitutionsUrl(), 'https://www.v-lo.krakow.pl/');
    const proxiedUrl = toProxiedUrl(url).toString();
    const response = await fetchWithCache(
      cacheMode,
      proxiedUrl,
      {
        method: 'POST',
        body: JSON.stringify(getSubstitutionsBody(date.toString(), false)),
      },
      `${proxiedUrl}|${date.toString()},`,
    );
    const body = await response.text();
    const parsed = parseSubstitutions(body);
    const substitutions = new DefaultsMap<string, Substitution[]>(() => []);
    parsed.sections.forEach((section) => {
      substitutions.get(section.name.toLowerCase()).push(...section.changes);
    });
    return (classValue: string) => substitutions.get(classValue.toLowerCase());
  }

  private async loadLessons(
    cacheMode: CacheMode,
    unitType: UnitType,
    unit: string,
    offset: number,
  ): Promise<{
    date: Temporal.PlainDate,
    moments: TableLessonMoment[],
  }[]> {
    if (unitType !== 'class') throw new Error('Not implemented');
    const monday = mondayOf(Temporal.Now.plainDateISO()).add({ weeks: offset });
    const response = await fetchWithCache(
      cacheMode,
      new URL(`/v2/ttdata?classid=${encodeURIComponent(unit)}&date=${monday.toString()}`, v2ApiOrigin).toString(),
      undefined,
    );
    const body = await response.json() as LessonResponse;
    return body.ttdata.map((day, dayIndex) => {
      const moments: TableLessonMoment[] = [];
      let date = monday.add({ days: dayIndex });
      _.flatten(day).forEach((lesson) => {
        date = Temporal.PlainDate.from(lesson.date);
        while (moments.length < lesson.time_index + lesson.duration) {
          moments.push({
            umid: toUmid(this.key, unitType, unit, dayIndex, moments.length),
            lessons: [],
          });
        }
        for (let i = lesson.time_index; i < lesson.time_index + lesson.duration; i += 1) {
          moments[i].lessons.push({
            subject: lesson.subject,
            subjectShort: lesson.subject_short,
            teacher: lesson.teacher.short ? lesson.teacher : undefined,
            room: lesson.classroom || undefined,
            group: lesson.group ? {
              key: lesson.group.raw,
              name: lesson.group.name,
              short: lesson.group.short,
            } : undefined,
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
  ): Promise<TableDataBase> {
    const cacheMode = fromCache ? CacheMode.CacheOnly : CacheMode.NetworkOnly;
    const days = await this.loadLessons(cacheMode, unitType, unit, offset);
    return {
      lessons: days.map((day) => day.moments),
      unitName: unit,
      unitType,
      unit,
      headers: days.map((day) => ({
        date: day.date,
      })),
    };
  }

  async getLessons(fromCache: boolean, unitType: UnitType, unit: string, offset: number): Promise<TableDataWithHours> {
    const cacheMode = fromCache ? CacheMode.CacheOnly : CacheMode.LazyUpdate;
    const monday = mondayOf(Temporal.Now.plainDateISO()).add({ weeks: offset });
    const [hours, partialData, substitutions] = await Promise.all([
      loadVLoHours(cacheMode),
      this.getLessonsPartial(fromCache, unitType, unit, offset),
      Promise.all([0, 1, 2, 3, 4].map((value) => VLoClient.loadVLoSubstitutions(
        cacheMode,
        monday.add({ days: value }),
      ))),
    ]);
    return {
      ...partialData,
      hours,
      headers: partialData.headers?.map((header, dayIndex) => ({
        ...header,
        substitutions: substitutions[dayIndex](unit),
      })) ?? null,
    };
  }

  async getLessonsOfAllClasses(fromCache: boolean, offset: number): Promise<AllClassesLessons> {
    const classList = await this.getClassList(fromCache ? CacheMode.CacheOnly : CacheMode.NetworkFirst);
    const monday = mondayOf(Temporal.Now.plainDateISO()).add({ weeks: offset });
    const cacheMode = fromCache ? CacheMode.CacheOnly : CacheMode.NetworkOnly;
    const [hours, lessons, substitutions] = await Promise.all([
      loadVLoHours(cacheMode),
      Promise.all(classList.map((item) => this.getLessonsPartial(fromCache, 'class', item.unit, offset))),
      Promise.all([0, 1, 2, 3, 4].map((value) => VLoClient.loadVLoSubstitutions(
        cacheMode,
        monday.add({ days: value }),
      ))),
    ]);
    return {
      hours,
      units: lessons.map((unit) => ({
        ...unit,
        headers: unit.headers?.map((header, dayIndex) => ({
          ...header,
          substitutions: substitutions[dayIndex](unit.unit),
        })) ?? null,
      })),
    };
  }

  getUnitNameMapper = async () => (unitType: string, unitValue: string) => unitValue;

  getTitle = async () => 'V LO w Krakowie';
}

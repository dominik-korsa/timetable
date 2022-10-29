import { CacheMode, fetchWithCache } from 'src/api/requests';
import {
  TableData,
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
  group: string;
  date: string;
  day_index: number;
  removed: boolean;
}

export async function loadVLoHours(cacheMode: CacheMode): Promise<TableHour[]> {
  const response = await fetchWithCache(cacheMode, 'https://api.cld.sh/vlo/timestamps');
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
    const response = await fetchWithCache(cacheMode, 'https://api.cld.sh/vlo/listclass');
    const classes = await response.json() as string[];
    return classes.map((value) => ({
      unit: value,
      name: value,
    }));
  }

  private static async loadVLoSubstitutions(
    cacheMode: CacheMode,
    classValue: string,
    date: Temporal.PlainDate,
  ): Promise<Substitution[]> {
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
    return parsed.sections
      .filter((value) => value.name.toLowerCase() === classValue.toLowerCase())
      .flatMap((value) => value.changes);
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
      `https://api.cld.sh/vlo/ttdata/${unit}?offset=${offset}`,
      undefined,
      `https://api.cld.sh/vlo/ttdata/${unit}?date=${monday.toString()}`,
    );
    const body = await response.json() as LessonResponseItem[][][];
    return body.map((day, dayIndex) => {
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
            teacher: lesson.teacher || undefined,
            room: lesson.classroom || undefined,
            group: lesson.group || undefined,
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

  async getLessons(
    fromCache: boolean,
    unitType: UnitType,
    unit: string,
    offset: number,
  ): Promise<TableData> {
    const cacheMode = fromCache ? CacheMode.CacheOnly : CacheMode.NetworkOnly;
    const monday = mondayOf(Temporal.Now.plainDateISO()).add({ weeks: offset });
    const [hours, days, substitutionDays] = await Promise.all([
      loadVLoHours(cacheMode),
      this.loadLessons(cacheMode, unitType, unit, offset),
      Promise.all([0, 1, 2, 3, 4].map((value) => VLoClient.loadVLoSubstitutions(
        cacheMode,
        unit,
        monday.add({ days: value }),
      ))),
    ]);
    return {
      hours,
      lessons: days.map((day) => day.moments),
      unitName: unit,
      unitType,
      unit,
      headers: days.map((day, dayIndex) => ({
        date: day.date,
        substitutions: substitutionDays[dayIndex],
      })),
    };
  }

  async getLessonsOfAllClasses(fromCache: boolean, offset: number): Promise<TableData[]> {
    const classList = await this.getClassList(fromCache ? CacheMode.CacheOnly : CacheMode.NetworkFirst);
    return Promise.all(
      classList.map((item) => this.getLessons(fromCache, 'class', item.unit, offset)),
    );
  }

  getUnitNameMapper = async () => (unitType: string, unitValue: string) => unitValue;

  getTitle = async () => 'V LO w Krakowie';
}

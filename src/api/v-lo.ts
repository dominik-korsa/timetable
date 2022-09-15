import { CacheMode, fetchWithCache } from 'src/api/requests';
import {
  TableHour, TableLessonMoment, toProxiedUrl, toUmid,
} from 'src/api/common';
import _ from 'lodash';
import { mondayOf } from 'src/date-utils';
import {
  Substitution,
  getSubstitutionsBody,
  getSubstitutionsUrl,
  parseSubstitutions,
} from '@wulkanowy/asc-timetable-parser';
import { Temporal } from '@js-temporal/polyfill';

export async function loadVLoClassList(cacheMode: CacheMode): Promise<string[]> {
  const response = await fetchWithCache(cacheMode, 'https://api.cld.sh/vlo/listclass');
  return await response.json() as string[];
}

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

export async function loadVLoLessons(
  cacheMode: CacheMode,
  classValue: string,
  offset: number,
): Promise<{
  date: Temporal.PlainDate,
  moments: TableLessonMoment[],
}[]> {
  const monday = mondayOf(Temporal.Now.plainDateISO()).add({ weeks: offset });
  const response = await fetchWithCache(
    cacheMode,
    `https://api.cld.sh/vlo/ttdata/${classValue}?offset=${offset}`,
    undefined,
    `https://api.cld.sh/vlo/ttdata/${classValue}?date=${monday.toString()}`,
  );
  const body = await response.json() as LessonResponseItem[][][];
  return body.map((day, dayIndex) => {
    const moments: TableLessonMoment[] = [];
    let date = monday.add({ days: dayIndex });
    _.flatten(day).forEach((lesson) => {
      date = Temporal.PlainDate.from(lesson.date);
      while (moments.length < lesson.time_index + lesson.duration) {
        moments.push({
          umid: toUmid(undefined, classValue, dayIndex, moments.length),
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
        });
      }
    });
    return {
      moments,
      date,
    };
  });
}

export async function loadVLoSubstitutions(
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

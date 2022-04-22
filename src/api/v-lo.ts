import { CacheMode, fetchWithCache } from 'src/api/requests';
import {
  TableHour, TableLessonMoment, toUmid,
} from 'src/api/common';
import _ from 'lodash';
import { mondayOf } from 'src/date-utils';

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

export interface VLoSubstitution {
  time_signature: string;
  comment: string;
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
  date: Date,
  moments: TableLessonMoment[],
}[]> {
  const monday = mondayOf(new Date());
  monday.setDate(monday.getDate() + 7 * offset);
  const [mondayISO] = monday.toISOString().split('T');
  const response = await fetchWithCache(
    cacheMode,
    `https://api.cld.sh/vlo/ttdata/${classValue}?offset=${offset}`,
    undefined,
    `https://api.cld.sh/vlo/ttdata/${classValue}?date=${mondayISO}`,
  );
  const body = await response.json() as LessonResponseItem[][][];
  return body.map((day, dayIndex) => {
    const moments: TableLessonMoment[] = [];
    let date = new Date(monday);
    date.setDate(date.getDate() + dayIndex);
    _.flatten(day).forEach((lesson) => {
      date = new Date(lesson.date);
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
  date: Date,
) {
  const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const now = new Date();
  const nowUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const offset = Math.round((dateUTC - nowUTC) / (1000 * 60 * 60 * 24));
  const response = await fetchWithCache(
    cacheMode,
    `https://api.cld.sh/vlo/substitutions/${classValue}?offset=${offset}`,
    undefined,
    `https://api.cld.sh/vlo/substitutions/${classValue}?date=${date.toISOString()}`,
  );
  return await response.json() as VLoSubstitution[];
}

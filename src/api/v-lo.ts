import { CacheMode, fetchWithCache } from 'src/api/requests';
import {
  TableHour, TableLessonMoment, toUmid,
} from 'src/api/common';
import _ from 'lodash';

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
): Promise<TableLessonMoment[][]> {
  const response = await fetchWithCache(cacheMode, `https://api.cld.sh/vlo/ttdata/${classValue}`);
  const body = await response.json() as LessonResponseItem[][][];
  return body.map((day, datIndex) => {
    const moments: TableLessonMoment[] = [];
    _.flatten(day).forEach((lesson) => {
      while (moments.length < lesson.time_index + lesson.duration) {
        moments.push({
          umid: toUmid(undefined, classValue, datIndex, moments.length),
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
    return moments;
  });
}

import { CacheMode, fetchWithCache } from 'src/api/requests';
import { TableHour, TableLesson } from 'src/api/common';
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
): Promise<TableLesson[][][]> {
  const response = await fetchWithCache(cacheMode, `https://api.cld.sh/vlo/ttdata/${classValue}`);
  const body = await response.json() as LessonResponseItem[][][];
  return body.map((dayResponse) => {
    const day: TableLesson[][] = [];
    _.flatten(dayResponse).forEach((lesson) => {
      while (day.length < lesson.time_index + lesson.duration) day.push([]);
      for (let i = lesson.time_index; i < lesson.time_index + lesson.duration; i += 1) {
        day[i].push({
          subject: lesson.subject,
          subjectShort: lesson.subject_short,
          teacher: lesson.teacher || undefined,
          room: lesson.classroom || undefined,
          group: lesson.group || undefined,
        });
      }
    });
    return day;
  });
}

import { Substitution } from '@wulkanowy/asc-timetable-parser';
import { Temporal } from '@js-temporal/polyfill';

export interface TableHour {
  begin: string;
  end: string;
  display: string;
}

export interface TableLesson {
  subject: string;
  subjectShort: string;
  teacher: string | undefined;
  room: string | undefined;
  group: string | undefined;
  color: string | undefined;
  removed: boolean;
}

export interface TableLessonMoment {
  umid: string;
  lessons: TableLesson[];
}

export interface TableData {
  hours: TableHour[];
  lessons: TableLessonMoment[][];
  className: string;
  headers: {
    date: Temporal.PlainDate;
    substitutions: Substitution[];
  }[] | null;
}

// Universal moment id
export const toUmid = (
  key: string,
  classValue: string,
  day: number,
  hour: number,
): string => `${encodeURIComponent(key)}|${encodeURIComponent(classValue)}|${day.toString()}|${hour.toString()}`;

export function toProxiedUrl(url: URL | string): URL {
  return new URL(`/${url}`, process.env.PROXY_URL);
}

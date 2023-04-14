import { Temporal } from '@js-temporal/polyfill';
import _ from 'lodash';
import { adjacentDifference, parseHour } from 'src/utils';

export interface TableHour {
  begin: string;
  end: string;
  display: string;
}

export interface TableLessonClass {
  name: string;
  id: string | undefined;
}

export interface TableLesson {
  subject: string;
  subjectShort: string;
  teacher: string | undefined;
  teacherId: string | undefined;
  room: string | undefined;
  roomId: string | undefined;
  group: {
    key: string;
    name: string;
  } | undefined;
  classes: TableLessonClass[];
  color: string | undefined;
  removed: boolean;
}

export interface TableLessonMoment {
  date?: Temporal.PlainDate;
  weekday: number;
  umid: string;
  lessons: TableLesson[];
}

export interface LessonRange {
  first: number;
  last: number;
}

export interface SubstitutionOther {
  type: 'other';
  comment: string;
}

export interface SubstitutionClassAbsent {
  type: 'classAbsent';
}

export interface SubstitutionCancellation {
  type: 'cancellation';
  teacher: string | null;
  group: string | null;
  subject: string;
  comment: string | null;
}

export interface SubstitutionSubstitution {
  type: 'substitution';
  group: string | null;
  subject_before: string | null;
  subject: string;
  teacher_before: string | null;
  teacher: string;
  comment: string | null;
}

export interface SubstitutionChange {
  type: 'change';
  groups: {
    group: string | null;
    subject: string;
    teacher: string;
  }[];
  comment: string | null;
}

export type SubstitutionInfo =
  SubstitutionOther
  | SubstitutionClassAbsent
  | SubstitutionCancellation
  | SubstitutionChange
  | SubstitutionSubstitution;

export interface Substitution {
  info: SubstitutionInfo;
  lessons: LessonRange | null;
}

export type UnitType = 'class' | 'teacher' | 'room';

export interface TableData {
  lessons: TableLessonMoment[][];
  unitName: string;
  unitType: UnitType;
  unit: string;
  headers: {
    date: Temporal.PlainDate;
    substitutions: Substitution[];
  }[] | null;
}

export interface TableDataWithHours extends TableData {
  hours: TableHour[];
}

export interface AllClassesLessons {
  units: TableData[];
  hours: TableHour[];
}

export const unitFullId = (
  key: string,
  unitType: UnitType,
  unit: string,
) => `${encodeURIComponent(key)}|${encodeURIComponent(unitType)}|${encodeURIComponent(unit)}`;

// Universal moment id
export const toUmid = (
  key: string,
  unitType: UnitType,
  unit: string,
  weekday: number,
  hour: number,
) => `${unitFullId(key, unitType, unit)}|${weekday}|${hour}`;

export interface ProxiedRequest {
  url: URL,
  headers: Headers,
}

export function toProxied(url: URL | string): ProxiedRequest {
  if (typeof url === 'string') url = new URL(url);
  const headers = new Headers();
  if (url.username !== '' || url.password !== '') {
    headers.set('Authorization', `Basic ${btoa(`${url.username}:${url.password}`)}`);
  }
  return {
    url: new URL(`/${url.origin}${url.pathname}${url.search}${url.hash}`, process.env.PROXY_URL),
    headers,
  };
}

export const calculateTimestamps = (hours: TableHour[], marginMinutes: number) => {
  const realTimestamps = _.flatMap(
    hours,
    ({ begin, end }) => [begin, end],
  )
    .map(parseHour);
  return [
    realTimestamps[0] - marginMinutes,
    ...realTimestamps,
    _.last(realTimestamps)! + marginMinutes,
  ];
};

export const calculateRows = (timestamps: number[], hourPixels: number) => adjacentDifference(timestamps)
  .map((v) => `${(v * hourPixels) / 60}px`)
  .join(' ');

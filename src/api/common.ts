import { Temporal } from '@js-temporal/polyfill';
import _ from 'lodash';
import { adjacentDifference, parseTimestamp } from 'src/utils';

export interface TableTimeSlot {
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
  subjectBefore: string | null;
  subject: string;
  teacherBefore: string | null;
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

export interface TableDataWithTimeSlots extends TableData {
  timeSlots: TableTimeSlot[];
}

export interface AllClassesLessons {
  units: TableData[];
  timeSlots: TableTimeSlot[];
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
  timeSlot: number,
) => `${unitFullId(key, unitType, unit)}|${weekday}|${timeSlot}`;

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

export const calculateTimestamps = (timeSlots: TableTimeSlot[], marginMinutes: number) => {
  const realTimestamps = _.flatMap(
    timeSlots,
    ({ begin, end }) => [begin, end],
  )
    .map(parseTimestamp);
  return [
    realTimestamps[0] - marginMinutes,
    ...realTimestamps,
    _.last(realTimestamps)! + marginMinutes,
  ];
};

export const calculateRows = (timestamps: number[], hourPixels: number) => adjacentDifference(timestamps)
  .map((v) => `${(v * hourPixels) / 60}px`)
  .join(' ');

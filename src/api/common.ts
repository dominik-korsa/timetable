import { Substitution } from '@wulkanowy/asc-timetable-parser';
import { Temporal } from '@js-temporal/polyfill';
import _ from 'lodash';
import { adjacentDifference, parseHour } from 'src/utils';

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
  group: {
    key: string;
    name: string;
  } | undefined;
  color: string | undefined;
  removed: boolean;
}

export interface TableLessonMoment {
  umid: string;
  lessons: TableLesson[];
}

export type UnitType = 'class' | 'teacher' | 'room';

export interface TableDataBase {
  lessons: TableLessonMoment[][];
  unitName: string;
  unitType: UnitType;
  unit: string;
  headers: {
    date: Temporal.PlainDate;
  }[] | null;
}

export interface TableData extends TableDataBase {
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
  day: number,
  hour: number,
) => `${unitFullId(key, unitType, unit)}|${day.toString()}|${hour.toString()}`;

export function toProxiedUrl(url: URL | string): URL {
  return new URL(`/${url}`, process.env.PROXY_URL);
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

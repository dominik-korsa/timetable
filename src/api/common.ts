export interface TableHour {
  begin: string;
  end: string;
  display: string;
}

export interface TableLesson {
  subject: string,
  subjectShort: string,
  teacher: string | undefined,
  room: string | undefined,
  group: string | undefined,
}

export interface TableData {
  hours: TableHour[];
  lessons: TableLesson[][][];
}

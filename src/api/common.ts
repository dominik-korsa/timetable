export interface TableHour {
  begin: string;
  end: string;
  display: string;
}

export interface TableData {
  hours: TableHour[];
}

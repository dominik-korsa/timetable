export const queryNames = {
  date: 'date',
} as const;

export const paramNames = {
  tri: 'tri',
  unitType: 'unitType',
  unit: 'unit',
} as const;

export const routeNames = {
  home: Symbol('Home route'),
  schoolHome: Symbol('School home route'),
  selectRoom: Symbol('Select room route'),
  unitTimetable: Symbol('Unit timetable route'),
  combinedTimetable: Symbol('Combined timetable route'),
  campaign: Symbol('Campaign route'),
  superSecretSettings: Symbol('Super Secret Settings route'),
} as const;

export const getCombinedTimetableUrl = (tri: string, date: string) => `/${tri}/combined?date=${date}`;

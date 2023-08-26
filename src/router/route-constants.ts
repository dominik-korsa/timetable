import { RouteLocation, RouteParams } from 'vue-router';

export const queryNames = {
  date: 'date',
} as const;

export const paramNames = {
  tri: 'tri',
  unitType: 'unitType',
  unit: 'unit',
} as const;

export const pickParams = (route: RouteLocation, ...params: (keyof typeof paramNames)[]) => {
  const result: Partial<RouteParams> = {};
  params.forEach((param) => {
    const paramName = paramNames[param];
    result[paramName] = route.params[paramName];
    if (result[paramName] === undefined) console.warn(`No value for param ${paramName} in route ${route.fullPath}`);
  });
  return result;
};

export const routeNames = {
  home: Symbol('Home route'),
  schoolHome: Symbol('School home route'),
  schoolUnitList: Symbol('School unit list route'),
  vLoMap: Symbol('V LO map route'),
  unitTimetable: Symbol('Unit timetable route'),
  combinedTimetable: Symbol('Combined timetable route'),
  campaign: Symbol('Campaign route'),
  superSecretSettings: Symbol('Super Secret Settings route'),
} as const;

export const getCombinedTimetableUrl = (tri: string, date: string) => `/${tri}/combined?date=${date}`;

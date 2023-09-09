import { RouteLocation, RouteParams } from 'vue-router';
import { triRegex } from 'src/router/tri';

export const queryNames = {
  date: 'date',
  selected: 'selected',
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

export const triParam = `:${paramNames.tri}(${triRegex.replaceAll(')', '\\)')})`;

console.log(triParam);

export const getCombinedTimetableUrl = (tri: string, date: string) => `/${tri}/combined?date=${date}`;

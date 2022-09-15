import { Temporal } from '@js-temporal/polyfill';

export function mondayOf(date: Temporal.PlainDate) {
  return date.subtract({
    days: date.dayOfWeek - 1,
  });
}

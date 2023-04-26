import { Temporal } from '@js-temporal/polyfill';

export function mondayOf(date: Temporal.PlainDate) {
  return date.subtract({
    days: date.dayOfWeek - 1,
  });
}

export function normalizeDate(date: Temporal.PlainDate) {
  if (date.dayOfWeek > 5) return date.add({ days: 8 - date.dayOfWeek });
  return date;
}

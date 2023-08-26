import { useConfigStore } from 'stores/config';
import { Temporal } from '@js-temporal/polyfill';
import { TableTimeSlot } from 'src/api/common';

const locale = 'pl-PL';

export const useFormatter = () => {
  const config = useConfigStore();

  const formatDisplay = (date: Temporal.PlainDate) => (
    config.iso8601 ? date.toString() : date.toLocaleString(locale)
  );

  return {
    formatDisplay,
    formatLabel: (date: Temporal.PlainDate) => date.toLocaleString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    formatDateTimeDisplay: (date: Temporal.PlainDateTime | Temporal.Instant) => {
      if (date instanceof Temporal.Instant) {
        date = date.toZonedDateTimeISO(Temporal.Now.timeZoneId()).toPlainDateTime();
      }
      return `${formatDisplay(date.toPlainDate())} ${date.toLocaleString(locale, {
        dateStyle: undefined,
        timeStyle: 'medium',
      })}`;
    },
    formatDateTimeLabel: (date: Temporal.PlainDateTime | Temporal.Instant) => date.toLocaleString(locale, {
      dateStyle: 'full',
      timeStyle: 'medium',
    }),
    formatTimeSlotLabel: (
      timeSlot: TableTimeSlot,
    ) => `Lekcja numer ${timeSlot.display}. Od godziny ${timeSlot.begin} do ${timeSlot.end}`,
  };
};

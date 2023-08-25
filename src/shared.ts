import {
  RouteLocationRaw, Router, useRoute, useRouter,
} from 'vue-router';
import {
  computed, ComputedRef, reactive, readonly, ref, watch,
} from 'vue';
import { Temporal } from '@js-temporal/polyfill';
import { useClientRef } from 'src/api/client';
import { useConfigStore } from 'stores/config';
import { UnitType } from 'src/api/common';
import { mondayOf, normalizeDate, tryParseDate } from 'src/date-utils';
import { useNow } from 'src/utils';
import { queryNames } from 'src/router/route-constants';

export function shake(el: Element, reverse: boolean) {
  const keyframes = [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-7px)' },
    { transform: 'translateX(7px)' },
    { transform: 'translateX(0)' },
  ];
  if (reverse) keyframes.reverse();
  el.animate(keyframes, { duration: 250 });
}

export function goBack(router: Router, to: RouteLocationRaw) {
  const resolved = router.resolve(to);
  if (resolved.href === window.history.state.back) router.back();
  else router.push(to);
}

export interface Offset {
  monday: Temporal.PlainDate,
  date: Temporal.PlainDate,
  decreaseDisabled: boolean;
  increaseDisabled: boolean;
  change: (direction: -1 | 1) => boolean;
  reset: () => void;
  isCurrentWeek: boolean;
  dayIndex: number;
  const: boolean;
}

const useDynamicOffset = (dateSource: ComputedRef<Temporal.PlainDate | null>): Offset => {
  const now = useNow(20000);
  const today = computed<Temporal.PlainDate>(() => {
    if (now.value.dayOfWeek < 5 && now.value.hour >= 18) return now.value.toPlainDate().add({ days: 1 });
    return normalizeDate(now.value.toPlainDate());
  });
  const normalizedDateSource = computed(() => {
    if (dateSource.value === null) return null;
    return normalizeDate(dateSource.value);
  });

  const date = ref(normalizedDateSource.value ?? today.value);
  const monday = computed(() => mondayOf(date.value));

  watch(normalizedDateSource, (value, oldValue) => {
    if (value === null) return;
    if (oldValue !== null && value.equals(oldValue)) return;
    date.value = value;
  });

  const decreaseDisabled = computed(() => {
    const limit = mondayOf(today.value).subtract({ weeks: 10 });
    return Temporal.PlainDate.compare(monday.value, limit) !== 1;
  });
  const increaseDisabled = computed(() => {
    const limit = mondayOf(today.value).add({ weeks: 2 });
    return Temporal.PlainDate.compare(monday.value, limit) !== -1;
  });

  return reactive({
    monday,
    date,
    decreaseDisabled,
    increaseDisabled,
    change: (direction: -1 | 1) => {
      if (direction === -1 && !decreaseDisabled.value) {
        date.value = date.value.subtract({ weeks: 1 });
        return true;
      }
      if (direction === 1 && !increaseDisabled.value) {
        date.value = date.value.add({ weeks: 1 });
        return true;
      }
      return false;
    },
    reset: () => { date.value = today.value; },
    isCurrentWeek: computed(() => monday.value.equals(mondayOf(today.value))),
    dayIndex: computed<number>({
      get: () => date.value.dayOfWeek - 1,
      set: (value) => {
        if (value < 0 || value >= 5) throw new Error(`Invalid offset.dayIndex ${value}`);
        date.value = monday.value.add({ days: value });
      },
    }),
    const: false,
  });
};

const unixMonday = mondayOf(Temporal.PlainDate.from('1970-01-01'));

const useConstOffset = (): Offset => reactive({
  monday: unixMonday,
  date: unixMonday,
  decreaseDisabled: true,
  increaseDisabled: true,
  dayIndex: normalizeDate(Temporal.Now.plainDateISO()).dayOfWeek - 1,
  change: () => false,
  isCurrentWeek: true,
  reset: () => { /* Does nothing */ },
  const: true,
});

export const useOffset = (isConst: () => boolean, dateSource: ComputedRef<Temporal.PlainDate | null>) => {
  const dynamicOffset = useDynamicOffset(dateSource);
  const constOffset = useConstOffset();
  return computed(() => (isConst() ? constOffset : dynamicOffset));
};

export const useSyncedOffset = (isConst: () => boolean) => {
  const router = useRouter();
  const route = useRoute();

  const storageKey = 'last-date';
  const disposed = ref(false);

  const queryDate = computed(
    () => tryParseDate(route.query[queryNames.date]) ?? tryParseDate(sessionStorage.getItem(storageKey)),
  );

  const offset = useOffset(isConst, queryDate);

  watch(() => (offset.value.const ? null : offset.value.date), (value) => {
    if (disposed.value || !value) return;
    sessionStorage.setItem(storageKey, value.toString());

    if (!queryDate.value || value.equals(queryDate.value)) return;
    router.replace({
      query: {
        ...route.query,
        [queryNames.date]: value.toString(),
      },
    });
  }, { immediate: true });

  return {
    offset,
    disposeOffset: () => {
      disposed.value = true;
      sessionStorage.removeItem(storageKey);
    },
    offsetDisposed: readonly(disposed),
  };
};

export const weekdayNames = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek'];
export const weekdayNamesShort = ['pon', 'wt', 'śr', 'czw', 'pt'];

export const useIsFavourite = () => {
  const clientRef = useClientRef();
  const config = useConfigStore();

  return computed<(unitType: UnitType, unit: string) => boolean>(() => {
    if (clientRef.value === undefined) return () => false;
    const set = new Set(
      config.favouriteUnits[clientRef.value.tri]
        ?.map(({
          unitType,
          unit,
        }) => `${unitType}|${unit}`)
      ?? [],
    );
    return (unitType, unit) => set.has(`${unitType}|${unit}`);
  });
};

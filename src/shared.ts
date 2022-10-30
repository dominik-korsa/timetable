import { RouteLocationRaw, Router } from 'vue-router';
import { computed, reactive } from 'vue';
import { Temporal } from '@js-temporal/polyfill';
import { getWeekOffsetSession } from 'src/session';
import { useClientRef } from 'src/api/client';
import { useConfigStore } from 'stores/config';
import { UnitType } from 'src/api/common';

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
  current: number;
  decreaseDisabled: boolean;
  increaseDisabled: boolean;
  change: (direction: -1 | 1) => boolean;
  reset: () => void;
  isCurrentWeek: boolean;
}

export const useOffset = (): Offset => {
  const todayOffset = computed<number>(
    () => ([6, 7].includes(Temporal.Now.plainDateISO().dayOfWeek) ? 1 : 0),
  );
  const currentOffset = getWeekOffsetSession(todayOffset.value);
  const decreaseDisabled = computed(() => currentOffset.value <= -5);
  const increaseDisabled = computed(() => currentOffset.value >= 5);
  return reactive({
    current: currentOffset,
    decreaseDisabled,
    increaseDisabled,
    change: (direction: -1 | 1) => {
      if (direction === -1 && !decreaseDisabled.value) {
        currentOffset.value -= 1;
        return true;
      }
      if (direction === 1 && !increaseDisabled.value) {
        currentOffset.value += 1;
        return true;
      }
      return false;
    },
    reset: () => { currentOffset.value = todayOffset.value; },
    isCurrentWeek: computed(() => currentOffset.value === todayOffset.value),
  });
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

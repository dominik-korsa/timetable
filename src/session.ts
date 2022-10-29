import { ref, watch } from 'vue';

export function useSessionStorage<T>(key: string, defaultValue: T) {
  const json = sessionStorage.getItem(key);
  const backing = ref(json === null ? defaultValue : (JSON.parse(json) as T));
  watch(backing, (value) => {
    sessionStorage.setItem(key, JSON.stringify(value));
  }, { immediate: true });
  return backing;
}

export const getWeekOffsetSession = (defaultValue: number) => useSessionStorage<number>('week-offset', defaultValue);

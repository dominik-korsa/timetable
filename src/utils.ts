import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Temporal } from '@js-temporal/polyfill';
import { colors } from 'quasar';
import _ from 'lodash';
import textToRgb = colors.textToRgb;
import rgbToHex = colors.rgbToHex;
import hsvToRgb = colors.hsvToRgb;

export function useDocumentListener<K extends keyof DocumentEventMap>(
  type: K,
  listener: (this: Document, ev: DocumentEventMap[K]) => unknown,
): void {
  onMounted(() => {
    document.addEventListener(type, listener);
  });
  onBeforeUnmount(() => {
    document.removeEventListener(type, listener);
  });
}

export function useInterval<Args extends []>(
  handler: (...handlerArgs: Args) => unknown,
  timeout: number,
  immediate = false,
  ...args: Args
): void {
  let intervalId: number | undefined;
  onMounted(() => {
    clearInterval(intervalId);
    intervalId = setInterval(handler, timeout, ...args) as unknown as number;
    if (immediate) handler(...args);
  });
  onBeforeUnmount(() => {
    clearInterval(intervalId);
    intervalId = undefined;
  });
}

export class DefaultsMap<K, V> extends Map<K, V> {
  private readonly generateDefault: (key: K) => V;

  constructor(defaultGenerator: (key: K) => V) {
    super();
    this.generateDefault = defaultGenerator;
  }

  override get(key: K): V {
    let value = super.get(key);
    if (value !== undefined) return value;
    value = this.generateDefault(key);
    this.set(key, value);
    return value;
  }
}

export function parseTimestamp(value: string): number {
  const [hours, minutes] = value.split(':').map((v) => parseInt(v, 10));
  return hours * 60 + minutes;
}

export function adjacentDifference(array: number[]): number[] {
  if (array.length === 0) return [];
  return array.slice(1).map((v, i) => v - array[i]);
}

export function common<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  const value = array[0];
  return array.every((v) => v === value) ? value : undefined;
}

export function getTypeValidator<T extends unknown[]>() {
  // noinspection JSUnusedLocalSymbols
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (...args: T) => true;
}

export const typed = <T>(x: T): T => x;

export function stringHash(input: string, hash: number) {
  for (let i = 0; i < input.length; i += 1) {
    hash *= 709;
    hash += input.charCodeAt(i);
    hash %= 1000859;
  }
  return hash;
}

export const randomColor = (source: string) => rgbToHex(hsvToRgb({
  h: ((stringHash(source, 2137) % 360) + 360) % 360,
  s: 50 + (((stringHash(source, 997) % 50) + 50) % 50),
  v: 70 + (((stringHash(source, 1933) % 30) + 30) % 30),
}));

export const withOpacity = (color: string, alpha: number) => rgbToHex({
  ...textToRgb(color),
  a: alpha,
});

export const bangEncode = (input: string) => encodeURIComponent(input)
  .replaceAll('.', '%2E')
  .replaceAll('!', '%21')
  .replaceAll('%', '!');

export const bangDecode = (input: string) => decodeURIComponent(input.replaceAll('!', '%'));

export const useNow = (interval: number) => {
  const now = ref(Temporal.Now.zonedDateTimeISO());
  useInterval(() => {
    now.value = Temporal.Now.zonedDateTimeISO();
  }, interval, true);
  return now;
};

export const createArray = <T>(n: number, getDefault: (index: number) => T): T[] => {
  const result: T[] = [];
  for (let i = 0; i < n; i += 1) result.push(getDefault(i));
  return result;
};

export const balance = (itemCount: number, maxCount: number) => {
  const rowCount = Math.ceil(itemCount / maxCount);
  return Math.ceil(itemCount / rowCount);
};

export const chunkBalanced = <T>(items: T[], maxCount: number) => _.chunk(
  items,
  balance(items.length, maxCount),
);

export const notNull = <T>(value: T | null): value is T => value !== null;

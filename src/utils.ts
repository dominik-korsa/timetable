import { onBeforeUnmount, onMounted } from 'vue';

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

export function parseHour(value: string): number {
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

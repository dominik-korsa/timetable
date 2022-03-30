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

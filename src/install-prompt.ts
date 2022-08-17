import { ref } from 'vue';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;

  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;

  prompt(): Promise<void>;
}

export const installPromptEvent = ref<BeforeInstallPromptEvent | null>(null);

export function setupListeners() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPromptEvent.value = event as BeforeInstallPromptEvent;
  });

  window.addEventListener('appinstalled', () => {
    installPromptEvent.value = null;
  });
}

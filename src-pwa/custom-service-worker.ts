/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxPluginMode is set to "InjectManifest"
 */

import { precacheAndRoute } from 'workbox-precaching';
import { showNotification } from 'src/push/push-notifier';

declare let self: ServiceWorkerGlobalScope;
export {};

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', async (event) => {
  if (!event.data) {
    console.error('Push message has no data');
    return;
  }
  await showNotification(await event.data.json(), self.registration);
});

self.addEventListener('install', () => {
  self.skipWaiting().catch();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

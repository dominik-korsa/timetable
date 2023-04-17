/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxPluginMode is set to "InjectManifest"
 */

import { precacheAndRoute } from 'workbox-precaching';
import { showNotification } from 'src/push/push-notifier';
import { SubstitutionNotificationData } from 'src/push/push-types.js';

declare let self: ServiceWorkerGlobalScope;
export {};

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event) => {
  if (!event.data) {
    console.error('Push message has no data');
    return;
  }
  event.waitUntil(showNotification(event.data.json(), self.registration));
});

self.addEventListener('notificationclick', (event) => {
  if (event.action) return;
  const notificationData: SubstitutionNotificationData | undefined = event.notification.data;
  if (!notificationData) return;
  event.notification.close();
  event.waitUntil(self.clients.openWindow(`/${notificationData.tri}/combined`));
});

self.addEventListener('install', () => {
  self.skipWaiting().catch();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

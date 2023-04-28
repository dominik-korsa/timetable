/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxPluginMode is set to "InjectManifest"
 */

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { showNotification } from 'src/push/push-notifier';
import { SubstitutionNotificationData } from 'src/push/push-types';
import { getCombinedTimetableUrl } from 'src/router/route-constants';

declare let self: ServiceWorkerGlobalScope;
export {};

self.skipWaiting().catch();
clientsClaim();

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML!),
      { denylist: [/sw\.js$/, /workbox-(.)*\.js$/] },
    ),
  );
}

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
  event.waitUntil(self.clients.openWindow(getCombinedTimetableUrl(notificationData.tri, notificationData.date)));
});

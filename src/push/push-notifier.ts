import { NotificationBody, NotificationDate, SubstitutionNotificationData } from 'src/push/push-types';

function formatBody(changes: NotificationDate) {
  const prefix = changes.wasEmpty ? 'Wpisane' : 'Zmiany';
  if (changes.changedClasses.length === 1) return `${prefix} w klasie ${changes.changedClasses[0]}`;
  return `${prefix} w klasach ${changes.changedClasses.join(', ')}`;
}

export async function showNotification(body: NotificationBody, swRegistration: ServiceWorkerRegistration) {
  await Promise.all(body.changedDates.map(async (changes) => {
    const data: SubstitutionNotificationData = {
      type: 'substitution',
      date: changes.date,
      tri: 'v-lo',
    };
    await swRegistration.showNotification(
      `${changes.wasEmpty ? 'Dodano' : 'Zmieniono'} zastępstwa w dniu ${changes.date}`,
      {
        lang: 'pl',
        body: formatBody(changes),
        icon: '/icons/icon-512x512.png',
        data,
      },
    );
  }));
}

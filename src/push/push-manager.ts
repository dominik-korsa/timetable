import { fetchWithErrors } from 'src/api/requests';

const options: PushSubscriptionOptionsInit = {
  userVisibleOnly: true,
  applicationServerKey: process.env.WEB_PUSH_VAPID_PUBLIC_KEY,
};

export async function getRegistrationStatus(): Promise<PermissionState> {
  const workerRegistration = await navigator.serviceWorker.ready;
  const state = await workerRegistration.pushManager.permissionState(options);
  if (state !== 'granted') return state;
  return await workerRegistration.pushManager.getSubscription() === null ? 'prompt' : 'granted';
}

export function enableNotifications() {
  return Notification.requestPermission();
}

export async function subscribePush() {
  const workerRegistration = await navigator.serviceWorker.ready;
  const subscription = await workerRegistration.pushManager.subscribe(options);
  try {
    await fetchWithErrors(`${process.env.WEB_PUSH_BACKEND_ORIGIN}/register`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription.toJSON()),
    });
  } catch (error) {
    await subscription.unsubscribe();
    throw error;
  }
}

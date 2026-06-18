import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { addStoredNotification } from '../modules/notifications/store/notificationStore';

export const DEFAULT_NOTIFICATION_CHANNEL_ID = 'default';
/** Must match backend FCM `android.notification.channelId` */
export const ORDER_UPDATES_CHANNEL_ID = 'order_updates';

export async function ensureDefaultAndroidChannel() {
  await notifee.createChannel({
    id: DEFAULT_NOTIFICATION_CHANNEL_ID,
    name: 'General',
    importance: AndroidImportance.HIGH,
  });
  await notifee.createChannel({
    id: ORDER_UPDATES_CHANNEL_ID,
    name: 'Order updates',
    importance: AndroidImportance.HIGH,
  });
}

export const requestNotificationPermission = async () => {
  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Permission granted');
  }
};

export async function requestLocalNotificationPermission() {
  try {
    await notifee.requestPermission();
  } catch {
    // ignore
  }
}

export async function getFcmToken(): Promise<string | null> {
  try {
    return await messaging().getToken();
  } catch {
    return null;
  }
}

export async function displayLocalNotification({
  title,
  body,
  data,
}: {
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  await ensureDefaultAndroidChannel();
  await addStoredNotification({
    title,
    body,
    variant: 'default',
    thumbnail: null,
    data: data ?? {},
  });
  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId: DEFAULT_NOTIFICATION_CHANNEL_ID,
      pressAction: { id: 'default' },
    },
  });
}

export function registerForegroundMessageHandler() {
  return messaging().onMessage(async remoteMessage => {
    const title =
      remoteMessage.notification?.title ??
      remoteMessage.data?.title ??
      'MPSConnect';
    const body =
      remoteMessage.notification?.body ??
      remoteMessage.data?.body ??
      '';
    if (!body) {
      return;
    }
    const safeTitle = typeof title === 'string' ? title : 'MPSConnect';
    const safeBody = typeof body === 'string' ? body : '';
    const safeData: Record<string, string> | undefined = remoteMessage.data
      ? Object.fromEntries(
          Object.entries(remoteMessage.data).map(([k, v]) => [k, String(v)]),
        )
      : undefined;
    await displayLocalNotification({
      title: safeTitle,
      body: safeBody,
      data: safeData,
    });
  });
}

export async function initPushNotifications() {
  await requestNotificationPermission();
  await requestLocalNotificationPermission();
  await ensureDefaultAndroidChannel();
  // Ensure token generation early (caller can send to backend later)
  await getFcmToken();
}

export function onFcmTokenRefresh(handler: (token: string) => void) {
  return messaging().onTokenRefresh(handler);
}
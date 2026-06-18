/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { displayLocalNotification } from './src/services/notificationService';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  const title =
    remoteMessage?.notification?.title ??
    remoteMessage?.data?.title ??
    'MPSConnect';
  const body =
    remoteMessage?.notification?.body ??
    remoteMessage?.data?.body ??
    '';
  if (!body) {
    return;
  }
  await displayLocalNotification({
    title,
    body,
    data: remoteMessage?.data ?? undefined,
  });
});

AppRegistry.registerComponent(appName, () => App);

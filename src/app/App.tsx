import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NavigationProvider from './providers/NavigationProvider';
import StoreProvider from './providers/StoreProvider';
import ThemeProvider from './providers/ThemeProvider';
import {
  initPushNotifications,
  onFcmTokenRefresh,
  registerForegroundMessageHandler,
} from '../services/notificationService';
import { registerFcmTokenWithBackend } from '../services/pushToken.service';
import { useOrderStatusWatcher } from '../modules/services/hooks/useOrderStatusWatcher';

function App() {
  useOrderStatusWatcher();

  React.useEffect(() => {
    void (async () => {
      await initPushNotifications().catch(() => undefined);
      await registerFcmTokenWithBackend().catch(() => undefined);
    })();
    const unsubscribe = registerForegroundMessageHandler();
    const unsubscribeRefresh = onFcmTokenRefresh(() => {
      registerFcmTokenWithBackend().catch(() => undefined);
    });
    return () => {
      unsubscribe();
      unsubscribeRefresh();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StoreProvider>
          <NavigationProvider />
        </StoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;

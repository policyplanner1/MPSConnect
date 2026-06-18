import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { getCrmEnquiryUserId } from '../../../core/utils/crmUserSession';
import { getToken } from '../../../core/utils/storage';
import { fetchMyOrders } from '../api/myOrdersApi';
import {
  ORDER_STATUS_POLL_MS,
  processOrderStatusNotifications,
} from '../services/orderStatusNotifications';

/**
 * Watches order statuses app-wide:
 * - on mount (logged in)
 * - when app returns to foreground
 * - periodic poll while app stays active
 *
 * Note: If the OS kills the app, only server-sent FCM can notify the user.
 */
export function useOrderStatusWatcher() {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const checking = useRef(false);

  const checkOrders = useCallback(async () => {
    if (checking.current) {
      return;
    }
    const token = await getToken();
    if (!token) {
      return;
    }

    checking.current = true;
    try {
      const userId = await getCrmEnquiryUserId();
      if (!userId) {
        return;
      }

      const res = await fetchMyOrders(userId);
      const orders = Array.isArray(res.data) ? res.data : [];
      await processOrderStatusNotifications(orders);
    } catch {
      // ignore — user may be offline or MPS OAuth not ready yet
    } finally {
      checking.current = false;
    }
  }, []);

  useEffect(() => {
    void checkOrders();

    const sub = AppState.addEventListener('change', nextState => {
      const prev = appState.current;
      appState.current = nextState;
      if (prev.match(/inactive|background/) && nextState === 'active') {
        void checkOrders();
      }
    });

    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        void checkOrders();
      }
    }, ORDER_STATUS_POLL_MS);

    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [checkOrders]);

  return { checkNow: checkOrders };
}

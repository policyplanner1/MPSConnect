import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  addStoredNotification,
  filterNotifications,
  loadStoredNotifications,
  nextNotificationFilter,
} from '../store/notificationStore';

/**
 * @returns {{
 *   notifications: import('../store/notificationStore').AppNotification[];
 *   loading: boolean;
 *   filter: import('../store/notificationStore').NotificationFilter;
 *   cycleFilter: () => void;
 *   refresh: () => Promise<void>;
 *   unreadCount: number;
 *   seedMock?: () => Promise<void>;
 * }}
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(
    /** @type {import('../store/notificationStore').NotificationFilter} */ ('all'),
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await loadStoredNotifications();
      setNotifications(items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibleNotifications = useMemo(
    () => filterNotifications(notifications, filter),
    [notifications, filter],
  );

  const unreadCount = useMemo(
    () => notifications.filter(item => !item.read).length,
    [notifications],
  );

  const cycleFilter = useCallback(() => {
    setFilter(current => nextNotificationFilter(current));
  }, []);

  return {
    notifications: visibleNotifications,
    loading,
    filter,
    cycleFilter,
    refresh: load,
    unreadCount,
    // Optional: keep for dev testing; can be removed later.
    seedMock: async () => {
      const { MOCK_NOTIFICATIONS } = await import('../services/notification.service');
      for (const item of MOCK_NOTIFICATIONS) {
        await addStoredNotification({
          title: item.title,
          body: item.body,
          variant: item.variant,
          thumbnail: item.thumbnail ?? null,
          data: {},
        });
      }
      await load();
    },
  };
}

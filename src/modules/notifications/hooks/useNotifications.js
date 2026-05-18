import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchNotifications } from '../services/notification.service';
import {
  filterNotifications,
  nextNotificationFilter,
} from '../store/notificationStore';

/**
 * @returns {{
 *   notifications: import('../services/notification.service').AppNotification[];
 *   loading: boolean;
 *   filter: import('../store/notificationStore').NotificationFilter;
 *   cycleFilter: () => void;
 *   refresh: () => Promise<void>;
 *   unreadCount: number;
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
      const items = await fetchNotifications();
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
  };
}

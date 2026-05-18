/** @typedef {'all' | 'unread'} NotificationFilter */

/** @type {Record<import('../services/notification.service').NotificationVariant, { backgroundColor: string }>} */
export const NOTIFICATION_VARIANT_STYLES = {
  default: { backgroundColor: '#FFFFFF' },
  muted: { backgroundColor: '#F3F4F6' },
  info: { backgroundColor: '#E8F3FF' },
  success: { backgroundColor: '#E8F8EE' },
  error: { backgroundColor: '#FFECEF' },
};

/** @type {NotificationFilter[]} */
export const NOTIFICATION_FILTERS = ['all', 'unread'];

/**
 * @param {import('../services/notification.service').AppNotification[]} items
 * @param {NotificationFilter} filter
 */
export function filterNotifications(items, filter) {
  if (filter === 'unread') {
    return items.filter(item => !item.read);
  }
  return items;
}

/**
 * @param {NotificationFilter} current
 * @returns {NotificationFilter}
 */
export function nextNotificationFilter(current) {
  const index = NOTIFICATION_FILTERS.indexOf(current);
  return NOTIFICATION_FILTERS[(index + 1) % NOTIFICATION_FILTERS.length];
}

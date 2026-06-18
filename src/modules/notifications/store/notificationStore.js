/** @typedef {'all' | 'unread'} NotificationFilter */
/** @typedef {'default' | 'muted' | 'info' | 'success' | 'error'} NotificationVariant */
/**
 * @typedef {Object} AppNotification
 * @property {string} id
 * @property {string} title
 * @property {string} body
 * @property {string} timestamp
 * @property {NotificationVariant} variant
 * @property {boolean} [read]
 * @property {'passport' | null} [thumbnail]
 * @property {Record<string, string>} [data]
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_STORAGE_KEY = '@mpsconnect:notifications_v1';
const MAX_NOTIFICATIONS = 80;

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

function nowTimestampLabel() {
  try {
    return new Date().toLocaleString();
  } catch {
    return 'Now';
  }
}

/**
 * @returns {Promise<AppNotification[]>}
 */
export async function loadStoredNotifications() {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * @param {AppNotification[]} items
 */
export async function saveStoredNotifications(items) {
  try {
    await AsyncStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(items.slice(0, MAX_NOTIFICATIONS)),
    );
  } catch {
    // ignore
  }
}

/**
 * @param {{ title: string; body: string; variant?: NotificationVariant; thumbnail?: 'passport' | null; data?: Record<string, string> }} input
 * @returns {Promise<AppNotification>}
 */
export async function addStoredNotification(input) {
  const items = await loadStoredNotifications();
  const next = {
    id: String(Date.now()) + '-' + Math.random().toString(16).slice(2),
    title: input.title,
    body: input.body,
    timestamp: nowTimestampLabel(),
    variant: input.variant || 'default',
    thumbnail: input.thumbnail ?? null,
    data: input.data ?? {},
    read: false,
  };
  const merged = [next, ...items].slice(0, MAX_NOTIFICATIONS);
  await saveStoredNotifications(merged);
  return next;
}

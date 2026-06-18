import AsyncStorage from '@react-native-async-storage/async-storage';

import { displayLocalNotification } from '../../../services/notificationService';
import { addStoredNotification } from '../../notifications/store/notificationStore';
import type { MyOrdersParentOrder } from '../types/myOrders.types';

const ORDER_STATUS_NOTIFY_KEY = '@mpsconnect:order_status_notify_v1';
const ORDER_STATUS_NOTIFY_LIMIT_KEY = '@mpsconnect:order_status_notify_limit_v1';
export const MAX_STATUS_NOTIFICATIONS_PER_DAY = 2;

/** Poll interval while app is in foreground (ms). */
export const ORDER_STATUS_POLL_MS = __DEV__ ? 2 * 60 * 1000 : 10 * 60 * 1000;

let processingLock = false;

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toStatusKey(status: string): string {
  return String(status || '').trim().toLowerCase();
}

export function statusNotificationCopy(
  statusRaw: string,
): { title: string; body: string } | null {
  const s = toStatusKey(statusRaw);
  if (!s) {
    return null;
  }

  if (s.includes('pending') && s.includes('payment')) {
    return {
      title: 'Payment pending',
      body: 'Complete payment to start processing your request.',
    };
  }
  if (s.includes('pending')) {
    return {
      title: 'Request pending',
      body: 'Your request is pending. We’ll notify you when it moves ahead.',
    };
  }
  if (s.includes('in_progress') || s.includes('processing')) {
    return {
      title: 'Request in progress',
      body: 'Your request is being processed right now.',
    };
  }
  if (s.includes('paid')) {
    return {
      title: 'Payment received',
      body: 'We received your payment. Your request will be processed soon.',
    };
  }
  if (s === 'completed' || s.includes('success')) {
    return {
      title: 'Service completed',
      body: 'Your request was completed successfully.',
    };
  }
  if (s.includes('cancel')) {
    return {
      title: 'Request cancelled',
      body: 'Your request was cancelled. Check My requests for details.',
    };
  }
  if (s.includes('fail') || s.includes('reject')) {
    return {
      title: 'Update on your request',
      body: 'There was an issue with your request. Check My requests for details.',
    };
  }
  return null;
}

function statusVariant(statusRaw: string) {
  const s = toStatusKey(statusRaw);
  if (s.includes('cancel') || s.includes('fail') || s.includes('reject')) {
    return 'error';
  }
  if (s.includes('paid') || s === 'completed' || s.includes('success')) {
    return 'success';
  }
  if (s.includes('in_progress') || s.includes('processing')) {
    return 'info';
  }
  if (s.includes('pending')) {
    return 'muted';
  }
  return 'default';
}

/**
 * Compare current orders with saved statuses; notify on change (max 2/day per order).
 * Safe to call from any screen — not tied to MyRequestsScreen mount.
 */
export async function processOrderStatusNotifications(
  orders: MyOrdersParentOrder[],
): Promise<void> {
  if (!orders.length || processingLock) {
    return;
  }

  processingLock = true;
  try {
  const raw = await AsyncStorage.getItem(ORDER_STATUS_NOTIFY_KEY);
  const prevMap: Record<string, string> = raw ? JSON.parse(raw) : {};
  const limitRaw = await AsyncStorage.getItem(ORDER_STATUS_NOTIFY_LIMIT_KEY);
  const limitMap: Record<string, { day: string; count: number }> = limitRaw
    ? JSON.parse(limitRaw)
    : {};
  const day = todayKey();

  if (!raw) {
    const seed: Record<string, string> = {};
    orders.forEach(o => {
      seed[o.parent_order_id] = toStatusKey(o.status);
    });
    await AsyncStorage.setItem(ORDER_STATUS_NOTIFY_KEY, JSON.stringify(seed));
    return;
  }

  const nextMap: Record<string, string> = { ...prevMap };
  const nextLimitMap: Record<string, { day: string; count: number }> = { ...limitMap };

  for (const order of orders) {
    const id = order.parent_order_id;
    const nextStatus = toStatusKey(order.status);
    const prevStatus = prevMap[id];
    nextMap[id] = nextStatus;

    if (!prevStatus || prevStatus === nextStatus) {
      continue;
    }

    const limitState = nextLimitMap[id];
    const current =
      limitState && limitState.day === day ? limitState : { day, count: 0 };
    if (current.count >= MAX_STATUS_NOTIFICATIONS_PER_DAY) {
      nextLimitMap[id] = current;
      continue;
    }

    const copy = statusNotificationCopy(order.status);
    if (!copy) {
      continue;
    }

    await addStoredNotification({
      title: copy.title,
      body: copy.body,
      variant: statusVariant(order.status),
      thumbnail: null,
      data: {
        type: 'order_status',
        parent_order_id: id,
        status: String(order.status ?? ''),
      },
    });
    await displayLocalNotification({
      title: copy.title,
      body: copy.body,
      data: {
        type: 'order_status',
        parent_order_id: id,
        status: String(order.status ?? ''),
      },
    });

    nextLimitMap[id] = { day, count: current.count + 1 };
  }

  await AsyncStorage.setItem(ORDER_STATUS_NOTIFY_KEY, JSON.stringify(nextMap));
  await AsyncStorage.setItem(ORDER_STATUS_NOTIFY_LIMIT_KEY, JSON.stringify(nextLimitMap));
  } finally {
    processingLock = false;
  }
}

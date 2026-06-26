import type { MyOrdersParentOrder } from '../types/myOrders.types';

export function normalizeOrderStatus(status: unknown): string {
  return String(status ?? '').trim().toLowerCase();
}

export function isCancelledStatus(status: unknown): boolean {
  const s = normalizeOrderStatus(status);
  if (!s) {
    return false;
  }
  return (
    s.includes('cancel') ||
    s.includes('cancellation') ||
    s === 'cancelled' ||
    s === 'canceled'
  );
}

export function isFailedStatus(status: unknown): boolean {
  const s = normalizeOrderStatus(status);
  if (!s) {
    return false;
  }
  return s.includes('fail') || s.includes('reject');
}

export function isPendingPaymentStatus(status: unknown): boolean {
  const s = normalizeOrderStatus(status);
  return s.includes('pending') && s.includes('payment');
}

export function isAlreadyCancelledMessage(message: unknown): boolean {
  const s = normalizeOrderStatus(message);
  return (
    s.includes('already cancel') ||
    s.includes('already cancelled') ||
    s.includes('already canceled')
  );
}

export function resolveOrderDisplayStatus(
  order: Pick<MyOrdersParentOrder, 'status' | 'items'>,
  overrideStatus?: string | null,
): string {
  if (overrideStatus && overrideStatus.trim()) {
    return overrideStatus;
  }

  const items = order.items ?? [];
  const itemStatuses = items
    .map(item => item.status)
    .filter((status): status is string => typeof status === 'string' && status.trim().length > 0);

  if (itemStatuses.length > 0) {
    const cancelledStatuses = itemStatuses.filter(isCancelledStatus);
    if (cancelledStatuses.length === itemStatuses.length) {
      return cancelledStatuses[0] ?? 'cancelled';
    }
    const activeStatus = itemStatuses.find(status => !isCancelledStatus(status));
    if (activeStatus) {
      return activeStatus;
    }
  }

  return order.status;
}

/** True when the order should not appear in active / open-request lists. */
export function isCancelledOrder(order: MyOrdersParentOrder): boolean {
  if (isCancelledStatus(order.status)) {
    return true;
  }

  const resolved = resolveOrderDisplayStatus(order);
  if (isCancelledStatus(resolved)) {
    return true;
  }

  const items = order.items;
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }

  const itemStatuses = items
    .map(item => item.status)
    .filter((status): status is string => typeof status === 'string' && status.trim().length > 0);

  if (itemStatuses.length === 0) {
    return false;
  }

  return itemStatuses.every(isCancelledStatus);
}

export function isActiveOrder(order: MyOrdersParentOrder | { status: string }): boolean {
  if ('items' in order && isCancelledOrder(order as MyOrdersParentOrder)) {
    return false;
  }

  const resolved =
    'items' in order
      ? resolveOrderDisplayStatus(order as MyOrdersParentOrder)
      : order.status;

  const s = normalizeOrderStatus(resolved);
  if (s.includes('paid') || s === 'completed' || s === 'success') {
    return false;
  }
  if (isCancelledStatus(s) || isFailedStatus(s)) {
    return false;
  }
  return true;
}

export function shouldShowInMyRequests(order: MyOrdersParentOrder): boolean {
  return !isCancelledOrder(order);
}

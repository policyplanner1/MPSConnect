import AsyncStorage from '@react-native-async-storage/async-storage';

import type { MyOrdersParentOrder } from '../types/myOrders.types';

const ORDER_STATUS_OVERRIDES_KEY = '@mpsconnect:order_status_overrides_v1';

export type OrderStatusOverride = {
  parentOrderId: string;
  serviceOrderId?: number;
  status: string;
  updatedAt: string;
};

export async function getOrderStatusOverrides(): Promise<Record<string, OrderStatusOverride>> {
  try {
    const raw = await AsyncStorage.getItem(ORDER_STATUS_OVERRIDES_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Record<string, OrderStatusOverride>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function setOrderStatusOverride(params: {
  parentOrderId: string;
  serviceOrderId?: number;
  status?: string;
}): Promise<void> {
  const map = await getOrderStatusOverrides();
  map[params.parentOrderId] = {
    parentOrderId: params.parentOrderId,
    serviceOrderId: params.serviceOrderId,
    status: params.status ?? 'cancelled',
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(ORDER_STATUS_OVERRIDES_KEY, JSON.stringify(map));
}

export function applyStatusOverrides(
  orders: MyOrdersParentOrder[],
  overrides: Record<string, OrderStatusOverride>,
): MyOrdersParentOrder[] {
  if (!orders.length || !Object.keys(overrides).length) {
    return orders;
  }

  return orders.map(order => {
    const override = overrides[order.parent_order_id];
    if (!override) {
      return order;
    }

    return {
      ...order,
      status: override.status,
      items: order.items?.map(item =>
        override.serviceOrderId == null || item.id === override.serviceOrderId
          ? { ...item, status: override.status }
          : item,
      ),
    };
  });
}

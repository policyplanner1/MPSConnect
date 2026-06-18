import { useCallback, useEffect, useState } from 'react';

import { fetchMyOrders } from '../api/myOrdersApi';
import type { MyOrdersParentOrder } from '../types/myOrders.types';
import { getCrmUserId, getUserId } from '../../../core/utils/storage';

export function useMyOrders() {
  const [orders, setOrders] = useState<MyOrdersParentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const crmUserId = await getCrmUserId();
      const fallbackUserId = await getUserId();
      const userId = crmUserId ?? fallbackUserId;
      if (!userId) {
        throw new Error('Please login again to view your requests.');
      }

      const res = await fetchMyOrders(userId);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setOrders([]);
      setError(e instanceof Error ? e.message : 'Failed to load your requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch().catch(() => undefined);
  }, [refetch]);

  return { orders, loading, error, refetch };
}


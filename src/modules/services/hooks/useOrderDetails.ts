import { useCallback, useEffect, useState } from 'react';

import { getCrmUserId, getUserId } from '../../../core/utils/storage';
import { fetchOrderDetails } from '../api/orderDetailsApi';
import type { OrderDetailsData } from '../types/orderDetails.types';

export function useOrderDetails(parentOrderId: string | null) {
  const [data, setData] = useState<OrderDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!parentOrderId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const crmUserId = await getCrmUserId();
      const fallbackUserId = await getUserId();
      const userId = crmUserId ?? fallbackUserId;
      if (!userId) {
        throw new Error('Please login again to view your request details.');
      }
      const res = await fetchOrderDetails(parentOrderId, userId);
      setData(res.data ?? null);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  }, [parentOrderId]);

  useEffect(() => {
    refetch().catch(() => undefined);
  }, [refetch]);

  return { data, loading, error, refetch };
}


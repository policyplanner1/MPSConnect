import { useCallback, useEffect, useMemo, useState } from 'react';

import { getCrmUserId, getUserId } from '../../../core/utils/storage';
import { fetchCancellationDetails } from '../api/orderCancellationApi';
import type { OrderDetailsData } from '../types/orderDetails.types';
import {
  getOrderStatusOverrides,
  setOrderStatusOverride,
} from '../services/orderStatusOverrides';
import {
  isCancelledStatus,
  normalizeOrderStatus,
  resolveOrderDisplayStatus,
} from '../utils/orderStatus';

function shouldProbeCancellation(data: OrderDetailsData | null): boolean {
  const firstItem = data?.items?.[0];
  if (!firstItem) {
    return false;
  }
  if (isCancelledStatus(firstItem.status) || isCancelledStatus(data?.status)) {
    return false;
  }
  if (firstItem.cancellation?.can_cancel) {
    return false;
  }
  const parentStatus = normalizeOrderStatus(data?.status);
  return parentStatus.includes('pending');
}

export function useOrderCancellationState(
  parentOrderId: string,
  data: OrderDetailsData | null,
) {
  const [overrideStatus, setOverrideStatus] = useState<string | null>(null);
  const [probing, setProbing] = useState(false);

  const loadOverride = useCallback(async () => {
    const overrides = await getOrderStatusOverrides();
    const override = overrides[parentOrderId];
    if (override?.status) {
      setOverrideStatus(override.status);
      return override.status;
    }
    setOverrideStatus(null);
    return null;
  }, [parentOrderId]);

  const probeCancellation = useCallback(async () => {
    const firstItem = data?.items?.[0];
    if (!firstItem || !shouldProbeCancellation(data)) {
      return null;
    }

    setProbing(true);
    try {
      const crmUserId = await getCrmUserId();
      const fallbackUserId = await getUserId();
      const userId = crmUserId ?? fallbackUserId;
      if (!userId) {
        return null;
      }

      const details = await fetchCancellationDetails(firstItem.id, userId);
      const status = details.data?.status || 'cancelled';
      await setOrderStatusOverride({
        parentOrderId,
        serviceOrderId: firstItem.id,
        status,
      });
      setOverrideStatus(status);
      return status;
    } catch {
      return null;
    } finally {
      setProbing(false);
    }
  }, [data, parentOrderId]);

  useEffect(() => {
    void loadOverride();
  }, [loadOverride]);

  useEffect(() => {
    if (!data || overrideStatus) {
      return;
    }
    if (!shouldProbeCancellation(data)) {
      return;
    }
    void probeCancellation();
  }, [data, overrideStatus, probeCancellation]);

  const displayStatus = useMemo(() => {
    if (overrideStatus) {
      return overrideStatus;
    }
    if (!data) {
      return '';
    }
    return resolveOrderDisplayStatus(data);
  }, [data, overrideStatus]);

  const isCancelled = isCancelledStatus(displayStatus);

  const rememberCancelled = useCallback(
    async (serviceOrderId: number, status = 'cancelled') => {
      await setOrderStatusOverride({
        parentOrderId,
        serviceOrderId,
        status,
      });
      setOverrideStatus(status);
    },
    [parentOrderId],
  );

  return {
    displayStatus,
    isCancelled,
    probing,
    rememberCancelled,
    reloadOverride: loadOverride,
  };
}

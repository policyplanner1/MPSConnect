import { useCallback, useEffect, useState } from 'react';

import {
  getCrmEnquiryUserId,
  getCrmUserIdLinkErrorMessage,
  trySyncCrmUserIdFromProfile,
} from '../../../core/utils/crmUserSession';
import { fetchServiceCartItems, getServiceCartErrorMessage } from '../api/serviceCartApi';
import { ServiceCartLineItem } from '../types/cart.types';

export function useServiceCart() {
  const [items, setItems] = useState<ServiceCartLineItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const loadCart = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }
    setError(null);

    let resolvedUserId = await getCrmEnquiryUserId();
    if (resolvedUserId == null) {
      resolvedUserId = await trySyncCrmUserIdFromProfile();
    }
    if (resolvedUserId == null) {
      setUserId(null);
      setItems([]);
      setTotal(0);
      setError(getCrmUserIdLinkErrorMessage());
      if (!options?.silent) {
        setLoading(false);
      }
      return;
    }

    setUserId(resolvedUserId);

    try {
      const cart = await fetchServiceCartItems(resolvedUserId);
      setItems(cart.items);
      setTotal(cart.total);
    } catch (err) {
      setItems([]);
      setTotal(0);
      setError(getServiceCartErrorMessage(err));
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return {
    items,
    total,
    loading,
    error,
    userId,
    reload: loadCart,
  };
}

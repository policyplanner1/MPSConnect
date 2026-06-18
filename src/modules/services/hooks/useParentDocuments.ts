import { useCallback, useEffect, useState } from 'react';

import { getCrmUserId, getUserId } from '../../../core/utils/storage';
import {
  fetchParentDocuments,
  getParentDocumentsErrorMessage,
} from '../api/parentDocumentsApi';
import type { ParentDocumentsData } from '../types/parentDocuments.types';

export function useParentDocuments(parentOrderId: string | null) {
  const [data, setData] = useState<ParentDocumentsData | null>(null);
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
        throw new Error('Please log in again to upload documents.');
      }

      const response = await fetchParentDocuments(parentOrderId, userId);
      setData(response.data);
      setError(null);
    } catch (e) {
      setError(getParentDocumentsErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [parentOrderId]);

  useEffect(() => {
    refetch().catch(() => undefined);
  }, [refetch]);

  return { data, loading, error, refetch };
}

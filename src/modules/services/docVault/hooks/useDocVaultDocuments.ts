import { useCallback, useEffect, useState } from 'react';

import {
  deleteVaultDocument,
  downloadVaultDocument,
  fetchVaultDocument,
  fetchVaultDocuments,
  shareVaultDocument,
  updateVaultDocument,
  uploadVaultDocument,
} from '../api/documentsApi';
import type {
  UpdateVaultDocumentInput,
  UploadVaultDocumentInput,
  VaultDocumentRecord,
} from '../types/docVault.types';

export function useDocVaultDocuments() {
  const [documents, setDocuments] = useState<VaultDocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const refetch = useCallback(async (options?: { silent?: boolean }) => {
    if (options?.silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchVaultDocuments();
      setDocuments(data);
    } catch (e) {
      setDocuments([]);
      setError(e instanceof Error ? e.message : 'Failed to load documents.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refetch().catch(() => undefined);
  }, [refetch]);

  const uploadDocument = useCallback(async (input: UploadVaultDocumentInput) => {
    setActionLoading(true);
    setError(null);
    try {
      const created = await uploadVaultDocument(input);
      setDocuments(current => [created, ...current.filter(doc => doc.id !== created.id)]);
      return created;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to upload document.';
      setError(message);
      throw new Error(message);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const updateDocument = useCallback(async (id: string, input: UpdateVaultDocumentInput) => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await updateVaultDocument(id, input);
      setDocuments(current => current.map(doc => (doc.id === updated.id ? updated : doc)));
      return updated;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update document.';
      setError(message);
      throw new Error(message);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const removeDocument = useCallback(async (id: string) => {
    setActionLoading(true);
    setError(null);
    try {
      await deleteVaultDocument(id);
      setDocuments(current => current.filter(doc => doc.id !== id));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete document.';
      setError(message);
      throw new Error(message);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const downloadDocument = useCallback(async (id: string) => {
    setActionLoading(true);
    setError(null);
    try {
      return await downloadVaultDocument(id);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to download document.';
      setError(message);
      throw new Error(message);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const shareDocument = useCallback(async (document: VaultDocumentRecord) => {
    setActionLoading(true);
    setError(null);
    try {
      await shareVaultDocument(document);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to share document.';
      setError(message);
      throw new Error(message);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const loadDocument = useCallback(async (id: string) => {
    return fetchVaultDocument(id);
  }, []);

  return {
    documents,
    loading,
    refreshing,
    error,
    actionLoading,
    refetch,
    uploadDocument,
    updateDocument,
    removeDocument,
    downloadDocument,
    shareDocument,
    loadDocument,
  };
}

import { Linking, Platform, Share } from 'react-native';

import { DOCUMENTS_API_BASE_URL } from '../../../../config/env';
import documentsApiClient from '../../../../core/api/documentsAxiosClient';
import { getToken } from '../../../../core/utils/storage';
import type {
  UpdateVaultDocumentInput,
  UploadVaultDocumentInput,
  VaultDocumentRecord,
} from '../types/docVault.types';
import { DOC_VAULT_LOCAL_API_PATH, DOC_VAULT_UPLOAD_PATH } from '../constants';

/** Local DocVault API — `http://<host>:5000/api/v1/documents` (not CRM). */
export const VAULT_DOCUMENTS_API = {
  baseUrl: DOCUMENTS_API_BASE_URL,
  list: DOC_VAULT_LOCAL_API_PATH,
  upload: DOC_VAULT_UPLOAD_PATH,
  byId: (id: string | number) => `${DOC_VAULT_LOCAL_API_PATH}/${id}`,
  download: (id: string | number) => `${DOC_VAULT_LOCAL_API_PATH}/${id}/download`,
} as const;

type ApiListResponse = {
  success: boolean;
  data?: VaultDocumentRecord[];
  message?: string;
};

type ApiItemResponse = {
  success: boolean;
  data?: VaultDocumentRecord;
  message?: string;
};

type ApiMessageResponse = {
  success: boolean;
  message?: string;
};

export function getVaultDocumentsOrigin(): string {
  return DOCUMENTS_API_BASE_URL.replace(/\/api\/v1\/?$/i, '');
}

export function resolveVaultDocumentFileUrl(fileUrl: string): string {
  if (!fileUrl) {
    return '';
  }
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  const origin = getVaultDocumentsOrigin();
  return `${origin}${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    const message = response?.data?.message;
    if (message) {
      return message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export async function fetchVaultDocuments(): Promise<VaultDocumentRecord[]> {
  try {
    const response = await documentsApiClient.get<ApiListResponse>(VAULT_DOCUMENTS_API.list);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to load documents.');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to load documents.'));
  }
}

export async function fetchVaultDocument(id: string | number): Promise<VaultDocumentRecord> {
  try {
    const response = await documentsApiClient.get<ApiItemResponse>(
      VAULT_DOCUMENTS_API.byId(id),
    );

    if (!response.data?.success || !response.data.data) {
      throw new Error(response.data?.message || 'Document not found.');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to load document.'));
  }
}

async function buildAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  if (!token) {
    throw new Error('Please log in again to manage your documents.');
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
}

function normalizeUploadUri(uri: string): string {
  const trimmed = uri.trim();
  if (
    trimmed.startsWith('content://') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('ph://') ||
    trimmed.startsWith('assets-library://')
  ) {
    return trimmed;
  }
  return `file://${trimmed}`;
}

function inferVaultFileMimeType(name: string, type?: string | null): string {
  const normalized = (type ?? '').trim().toLowerCase();
  if (normalized && normalized !== 'application/octet-stream') {
    return normalized;
  }

  const ext = name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? '';
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

function appendFile(
  formData: FormData,
  fieldName: string,
  file: UploadVaultDocumentInput['file'],
) {
  const name = file.name?.trim() || `document-${Date.now()}.jpg`;
  formData.append(fieldName, {
    uri: normalizeUploadUri(file.uri),
    name,
    type: inferVaultFileMimeType(name, file.type),
  } as unknown as Blob);
}

export async function uploadVaultDocument(
  input: UploadVaultDocumentInput,
): Promise<VaultDocumentRecord> {
  const formData = new FormData();

  appendFile(formData, 'file', input.file);

  if (input.title?.trim()) {
    formData.append('title', input.title.trim());
  }
  if (input.description?.trim()) {
    formData.append('description', input.description.trim());
  }
  if (input.tags?.trim()) {
    formData.append('tags', input.tags.trim());
  }

  try {
    const response = await documentsApiClient.post<ApiItemResponse>(
      VAULT_DOCUMENTS_API.upload,
      formData,
      { timeout: 120000 },
    );

    if (!response.data?.success || !response.data.data) {
      throw new Error(response.data?.message || 'Upload failed.');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(
        error,
        'Network error while uploading. Check your connection and try again.',
      ),
    );
  }
}

export async function updateVaultDocument(
  id: string | number,
  input: UpdateVaultDocumentInput,
): Promise<VaultDocumentRecord> {
  const formData = new FormData();

  if (input.title?.trim()) {
    formData.append('title', input.title.trim());
  }
  if (input.description != null) {
    formData.append('description', input.description.trim());
  }
  if (input.tags != null) {
    formData.append('tags', input.tags.trim());
  }
  if (input.file) {
    appendFile(formData, 'file', input.file);
  }

  try {
    const response = await documentsApiClient.put<ApiItemResponse>(
      VAULT_DOCUMENTS_API.byId(id),
      formData,
      { timeout: 120000 },
    );

    if (!response.data?.success || !response.data.data) {
      throw new Error(response.data?.message || 'Update failed.');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(
        error,
        'Network error while updating. Check your connection and try again.',
      ),
    );
  }
}

export async function deleteVaultDocument(id: string | number): Promise<void> {
  try {
    const response = await documentsApiClient.delete<ApiMessageResponse>(
      VAULT_DOCUMENTS_API.byId(id),
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to delete document.');
    }
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to delete document.'));
  }
}

/**
 * Download / open a vault document via local API.
 * 1. Verifies access with GET /documents/:id
 * 2. Opens the file from the local server `/uploads/documents/...`
 */
export async function downloadVaultDocument(id: string | number): Promise<VaultDocumentRecord> {
  const headers = await buildAuthHeaders();

  const downloadUrl = `${DOCUMENTS_API_BASE_URL}${VAULT_DOCUMENTS_API.download(id)}`;

  let checkResponse: Response;
  try {
    checkResponse = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        ...headers,
        Accept: '*/*',
      },
    });
  } catch {
    throw new Error('Network error while downloading. Check your connection and try again.');
  }

  if (!checkResponse.ok) {
    const body = (await checkResponse.json().catch(() => null)) as ApiMessageResponse | null;
    throw new Error(body?.message || `Download failed (${checkResponse.status}).`);
  }

  const document = await fetchVaultDocument(id);
  const fileUrl = resolveVaultDocumentFileUrl(document.fileUrl);

  if (!fileUrl) {
    throw new Error('This document does not have a downloadable file.');
  }

  const canOpen = await Linking.canOpenURL(fileUrl);
  if (!canOpen) {
    throw new Error('Unable to open this document on your device.');
  }

  await Linking.openURL(fileUrl);
  return document;
}

/** Share a vault document link via the device share sheet. */
export async function shareVaultDocument(document: VaultDocumentRecord): Promise<void> {
  const fileUrl = resolveVaultDocumentFileUrl(document.fileUrl);
  if (!fileUrl) {
    throw new Error('This document does not have a shareable file.');
  }

  const shareContent =
    Platform.OS === 'ios'
      ? { url: fileUrl, title: document.title, message: document.title }
      : { message: `${document.title}\n${fileUrl}`, title: document.title };

  await Share.share(shareContent);
}

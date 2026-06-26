import axios from 'axios';

/**
 * Service ORDER document uploads (checkout / My Requests).
 * CRM endpoints: `/parent-documents`, `/submit-documents`.
 *
 * For personal DocVault storage use `docVault/api/documentsApi.ts` (local `/api/v1/documents`).
 */
import { MPS_SERVICE_BASE_URL } from '../../../config/env';
import {
  getMpsOAuthAuthorizationHeader,
  getMpsOAuthSession,
} from '../../../core/utils/mpsOAuthStorage';
import {
  ensureMpsOAuthToken,
  fetchMpsOAuthToken,
} from '../../../services/mpsOAuth.service';
import type { OrderDetailsData } from '../types/orderDetails.types';
import type {
  ParentDocumentsData,
  ParentDocumentsResponse,
  ParentOrderDocument,
  SubmitParentDocumentsPayload,
  SubmitParentDocumentsResponse,
  UploadParentDocumentResponse,
} from '../types/parentDocuments.types';
import { fetchOrderDetails } from './orderDetailsApi';

const PARENT_DOCUMENTS_BASE_URL = `${MPS_SERVICE_BASE_URL}/parent-documents`;
const SUBMIT_DOCUMENTS_BASE_URL = `${MPS_SERVICE_BASE_URL}/submit-documents`;

async function authHeaders(json = true): Promise<Record<string, string>> {
  await ensureMpsOAuthToken();
  const session = await getMpsOAuthSession();
  const authHeader = getMpsOAuthAuthorizationHeader(session);

  if (!authHeader) {
    throw new Error('Please log in again to manage your documents.');
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: authHeader,
  };

  if (json) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

function extractApiErrorMessage(data: unknown): string | null {
  if (!data) {
    return null;
  }
  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }
  if (typeof data === 'object' && 'message' in data) {
    const msg = (data as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) {
      return msg.trim();
    }
  }
  return null;
}

function isAuthDocumentsError(error: unknown): boolean {
  if (typeof axios.isAxiosError === 'function' && axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      return true;
    }
  }
  if (error instanceof Error) {
    return /log in again|unauthorized/i.test(error.message);
  }
  return false;
}

function shouldFallbackToOrderDetails(error: unknown): boolean {
  if (isAuthDocumentsError(error)) {
    return false;
  }
  if (typeof axios.isAxiosError === 'function' && axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status != null && status >= 500) {
      return true;
    }
    const message =
      extractApiErrorMessage(error.response?.data) ?? error.message ?? '';
    return /getPrivateFileUrl/i.test(message);
  }
  if (error instanceof Error) {
    if (/getPrivateFileUrl/i.test(error.message)) {
      return true;
    }
    if (/failed to load documents \(5\d{2}\)/i.test(error.message)) {
      return true;
    }
    if (/server error|unable to load documents from the server/i.test(error.message)) {
      return true;
    }
  }
  return false;
}

function mapOrderDetailsToParentDocuments(
  parentOrderId: string,
  order: OrderDetailsData,
): ParentDocumentsData {
  const byKey = new Map<string, ParentOrderDocument>();

  for (const item of order.items ?? []) {
    for (const doc of item.documents ?? []) {
      const existing = byKey.get(doc.document_key);
      if (!existing) {
        byKey.set(doc.document_key, {
          document_key: doc.document_key,
          document_name: doc.document_name,
          is_mandatory: doc.is_mandatory,
          is_expirable: doc.is_expirable,
          uploaded: doc.uploaded,
          expiry_date: doc.expiry_date,
          document_number: doc.document_number,
          file_url: doc.uploaded ? doc.file_url : null,
        });
        continue;
      }
      if (doc.uploaded) {
        existing.uploaded = true;
      }
    }
  }

  const documents = Array.from(byKey.values());
  const canSubmit =
    documents.length > 0 &&
    documents.every(doc => !doc.is_mandatory || doc.uploaded);

  return {
    parent_order_id: parentOrderId,
    can_submit: canSubmit,
    documents,
  };
}

async function fetchParentDocumentsFromOrderDetails(
  parentOrderId: string,
  userId: number,
): Promise<ParentDocumentsResponse> {
  const orderResponse = await fetchOrderDetails(parentOrderId, userId);
  if (!orderResponse.data) {
    throw new Error('Failed to load required documents.');
  }

  const data = mapOrderDetailsToParentDocuments(parentOrderId, orderResponse.data);
  if (data.documents.length === 0) {
    throw new Error('No documents are required for this order.');
  }

  return { success: true, data };
}

async function fetchParentDocumentsDirect(
  parentOrderId: string,
  userId: number,
): Promise<ParentDocumentsResponse> {
  const url = `${PARENT_DOCUMENTS_BASE_URL}/${encodeURIComponent(parentOrderId)}`;

  const response = await axios.get<ParentDocumentsResponse>(url, {
    params: { user_id: userId },
    headers: await authHeaders(),
    timeout: 20000,
    validateStatus: status => status < 500,
  });

  const body = response.data;
  const apiMessage = extractApiErrorMessage(body);

  if (response.status === 401 || response.status === 403) {
    throw new Error(apiMessage ?? 'Please log in again to manage your documents.');
  }

  if (response.status >= 500) {
    throw new Error(apiMessage ?? `Failed to load documents (${response.status}).`);
  }

  if (response.status >= 400) {
    throw new Error(apiMessage ?? `Failed to load documents (${response.status}).`);
  }

  if (!body?.success || !body.data) {
    const message = apiMessage ?? 'Failed to load required documents.';
    if (/getPrivateFileUrl/i.test(message)) {
      throw new Error(message);
    }
    throw new Error(message);
  }

  return body;
}

export async function fetchParentDocuments(
  parentOrderId: string,
  userId: number,
): Promise<ParentDocumentsResponse> {
  try {
    return await fetchParentDocumentsDirect(parentOrderId, userId);
  } catch (primaryError) {
    if (!shouldFallbackToOrderDetails(primaryError)) {
      throw primaryError;
    }
  }

  try {
    return await fetchParentDocumentsFromOrderDetails(parentOrderId, userId);
  } catch (fallbackError) {
    if (isAuthDocumentsError(fallbackError)) {
      throw fallbackError;
    }
    throw new Error(
      'Unable to load documents right now. Please try again shortly or contact support.',
    );
  }
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

function buildUploadFormData(params: {
  userId: number;
  documentKey: string;
  file: { uri: string; name: string; type: string };
  expiryDate?: string | null;
  documentNumber?: string | null;
}): FormData {
  const formData = new FormData();
  formData.append('user_id', String(params.userId));
  formData.append('upload_only', '1');
  formData.append(params.documentKey, {
    uri: normalizeUploadUri(params.file.uri),
    type: params.file.type || 'application/octet-stream',
    name: params.file.name || 'document.pdf',
  } as unknown as Blob);

  if (params.expiryDate) {
    formData.append(`${params.documentKey}_expiry_date`, params.expiryDate);
  }

  if (params.documentNumber) {
    formData.append(`${params.documentKey}_document_number`, params.documentNumber);
  }

  return formData;
}

async function parseUploadResponse(response: Response): Promise<UploadParentDocumentResponse> {
  const raw = await response.text();
  let body: UploadParentDocumentResponse | null = null;

  if (raw) {
    try {
      body = JSON.parse(raw) as UploadParentDocumentResponse;
    } catch {
      if (!response.ok) {
        throw new Error(`Upload failed (${response.status}).`);
      }
      throw new Error('Unexpected response from document upload.');
    }
  }

  if (response.status === 401) {
    const err = new Error(body?.message || 'Please log in again to upload documents.') as Error & {
      httpStatus?: number;
    };
    err.httpStatus = 401;
    throw err;
  }

  if (!response.ok) {
    throw new Error(body?.message || `Upload failed (${response.status}).`);
  }

  const ok = body?.success === true || body?.status === true;
  if (!ok) {
    throw new Error(body?.message || 'Failed to upload document.');
  }

  return body;
}

async function postUploadDocument(
  parentOrderId: string,
  formData: FormData,
  headers: Record<string, string>,
): Promise<UploadParentDocumentResponse> {
  const url = `${SUBMIT_DOCUMENTS_BASE_URL}/${encodeURIComponent(parentOrderId)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: headers.Authorization ?? '',
      },
      body: formData,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error while uploading. Check your internet connection and try again.');
    }
    throw error;
  }

  return parseUploadResponse(response);
}

export type ParentDocumentUploadItem = {
  documentKey: string;
  file: { uri: string; name: string; type: string };
  expiryDate?: string | null;
  documentNumber?: string | null;
};

function buildBatchUploadFormData(
  userId: number,
  documents: ParentDocumentUploadItem[],
): FormData {
  const formData = new FormData();
  formData.append('user_id', String(userId));
  formData.append('upload_only', '1');

  for (const doc of documents) {
    formData.append(doc.documentKey, {
      uri: normalizeUploadUri(doc.file.uri),
      type: doc.file.type || 'application/octet-stream',
      name: doc.file.name || 'document.pdf',
    } as unknown as Blob);

    if (doc.expiryDate) {
      formData.append(`${doc.documentKey}_expiry_date`, doc.expiryDate);
    }

    if (doc.documentNumber) {
      formData.append(`${doc.documentKey}_document_number`, doc.documentNumber);
    }
  }

  return formData;
}

async function postUploadWithAuthRetry(
  parentOrderId: string,
  formData: FormData,
): Promise<UploadParentDocumentResponse> {
  try {
    return await postUploadDocument(parentOrderId, formData, await authHeaders(false));
  } catch (error) {
    const httpStatus =
      typeof error === 'object' &&
      error !== null &&
      'httpStatus' in error &&
      typeof (error as { httpStatus?: unknown }).httpStatus === 'number'
        ? (error as { httpStatus: number }).httpStatus
        : null;

    const isUnauthorized =
      httpStatus === 401 ||
      (typeof axios.isAxiosError === 'function' &&
        axios.isAxiosError(error) &&
        error.response?.status === 401);

    if (!isUnauthorized) {
      throw error;
    }

    await fetchMpsOAuthToken();
    return await postUploadDocument(parentOrderId, formData, await authHeaders(false));
  }
}

export async function uploadParentOrderDocument(
  params: ParentDocumentUploadItem & {
    parentOrderId: string;
    userId: number;
  },
): Promise<UploadParentDocumentResponse> {
  const formData = buildUploadFormData(params);
  return postUploadWithAuthRetry(params.parentOrderId, formData);
}

/** Upload multiple documents in one request (used on Submit). */
export async function uploadParentOrderDocumentsBatch(params: {
  parentOrderId: string;
  userId: number;
  documents: ParentDocumentUploadItem[];
}): Promise<UploadParentDocumentResponse> {
  if (params.documents.length === 0) {
    return { success: true };
  }

  const formData = buildBatchUploadFormData(params.userId, params.documents);
  return postUploadWithAuthRetry(params.parentOrderId, formData);
}

async function postSubmitDocuments(
  parentOrderId: string,
  payload: SubmitParentDocumentsPayload,
  headers: Record<string, string>,
): Promise<SubmitParentDocumentsResponse> {
  const url = `${SUBMIT_DOCUMENTS_BASE_URL}/${encodeURIComponent(parentOrderId)}`;

  const response = await axios.post<SubmitParentDocumentsResponse>(url, payload, {
    headers,
    timeout: 25000,
  });

  const body = response.data;
  const ok = body?.status === true || body?.success === true;
  if (!ok) {
    throw new Error(body?.message || 'Failed to submit documents.');
  }

  return body;
}

export async function submitParentDocuments(
  parentOrderId: string,
  userId: number,
): Promise<SubmitParentDocumentsResponse> {
  const payload: SubmitParentDocumentsPayload = { user_id: userId };

  try {
    return await postSubmitDocuments(parentOrderId, payload, await authHeaders());
  } catch (error) {
    const isUnauthorized =
      typeof axios.isAxiosError === 'function' &&
      axios.isAxiosError(error) &&
      error.response?.status === 401;

    if (!isUnauthorized) {
      throw error;
    }

    await fetchMpsOAuthToken();
    return await postSubmitDocuments(parentOrderId, payload, await authHeaders());
  }
}

export function getParentDocumentsErrorMessage(error: unknown): string {
  if (error instanceof TypeError && /network request failed/i.test(error.message)) {
    return 'Network error while uploading. Check your internet connection and try again.';
  }

  if (typeof axios.isAxiosError === 'function' && axios.isAxiosError(error)) {
    const apiMessage = extractApiErrorMessage(error.response?.data);
    if (apiMessage) {
      if (/getPrivateFileUrl/i.test(apiMessage)) {
        return 'Documents are saved, but the server could not refresh the list. You can continue selecting files and submit when ready.';
      }
      return apiMessage;
    }
    if (error.response?.status === 500) {
      return 'Unable to load documents from the server. Please try again in a moment.';
    }
    if (error.message && !/^Request failed with status code \d+$/i.test(error.message)) {
      return error.message;
    }
    if (error.response?.status) {
      return `Unable to load documents (${error.response.status}). Please try again.`;
    }
  }
  if (error instanceof Error && error.message) {
    if (/network error/i.test(error.message)) {
      return 'Network error while uploading. Check your internet connection and try again.';
    }
    if (/getPrivateFileUrl/i.test(error.message)) {
      return 'Documents are saved, but the server could not refresh the list. You can continue selecting files and submit when ready.';
    }
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

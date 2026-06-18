import axios from 'axios';

import apiClient from '../../../core/api/axiosClient';
import { API_BASE_URL, MPS_SERVICE_BASE_URL } from '../../../config/env';
import { getMpsOAuthAuthorizationHeader, getMpsOAuthSession } from '../../../core/utils/mpsOAuthStorage';
import {
  ensureMpsOAuthToken,
  fetchMpsOAuthToken,
} from '../../../services/mpsOAuth.service';
import type {
  CancellationDetailsResponse,
  CancellationReason,
  CancellationReasonsResponse,
  SubmitCancelOrderRequestPayload,
  SubmitCancelOrderRequestResponse,
} from '../types/orderCancellation.types';

const CANCELLATION_REASONS_PATH = '/service-orders/cancellation-reasons';
const CANCELLATION_REASONS_URL = `${API_BASE_URL.replace(/\/+$/, '')}/service-orders/cancellation-reasons`;
const CANCEL_ORDER_REQUEST_URL = `${MPS_SERVICE_BASE_URL}/cancel-order-request`;

function normalizeReasonsResponse(body: unknown): CancellationReasonsResponse {
  if (!body || typeof body !== 'object') {
    throw new Error('Could not load cancellation reasons.');
  }
  const record = body as {
    success?: boolean;
    reasons?: CancellationReason[];
    data?: { reasons?: CancellationReason[] };
  };
  const reasons =
    (Array.isArray(record.reasons) && record.reasons) ||
    (record.data && Array.isArray(record.data.reasons) && record.data.reasons) ||
    null;
  if (!record.success || !reasons) {
    throw new Error('Could not load cancellation reasons.');
  }
  return { success: true, reasons };
}

async function mpsAuthHeaders(): Promise<Record<string, string>> {
  await ensureMpsOAuthToken();
  const session = await getMpsOAuthSession();
  const authHeader = getMpsOAuthAuthorizationHeader(session);
  if (!authHeader) {
    throw new Error('Please log in again to manage your order.');
  }
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: authHeader,
  };
}

export async function fetchCancellationReasons(): Promise<CancellationReasonsResponse> {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[CancelOrder] GET reasons', CANCELLATION_REASONS_URL);
  }

  try {
    const response = await apiClient.get(CANCELLATION_REASONS_PATH);
    return normalizeReasonsResponse(response.data);
  } catch (firstError) {
    try {
      const headers = await mpsAuthHeaders();
      const response = await axios.get(CANCELLATION_REASONS_URL, {
        headers,
        timeout: 20000,
      });
      return normalizeReasonsResponse(response.data);
    } catch {
      throw firstError;
    }
  }
}

async function postCancelOrderRequest(
  payload: SubmitCancelOrderRequestPayload,
  headers: Record<string, string>,
): Promise<SubmitCancelOrderRequestResponse> {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[CancelOrder] POST', CANCEL_ORDER_REQUEST_URL, payload);
  }
  const response = await axios.post<SubmitCancelOrderRequestResponse>(
    CANCEL_ORDER_REQUEST_URL,
    payload,
    { headers, timeout: 25000 },
  );
  return response.data;
}

export async function submitCancelOrderRequest(
  payload: SubmitCancelOrderRequestPayload,
): Promise<SubmitCancelOrderRequestResponse> {
  try {
    const body = await postCancelOrderRequest(payload, await mpsAuthHeaders());
    if (!body?.success) {
      throw new Error(body?.message || 'Cancellation not allowed at this stage.');
    }
    return body;
  } catch (error) {
    const isUnauthorized =
      typeof axios.isAxiosError === 'function' &&
      axios.isAxiosError(error) &&
      error.response?.status === 401;
    if (!isUnauthorized) {
      throw error;
    }
    await fetchMpsOAuthToken();
    const body = await postCancelOrderRequest(payload, await mpsAuthHeaders());
    if (!body?.success) {
      throw new Error(body?.message || 'Cancellation not allowed at this stage.');
    }
    return body;
  }
}

export async function fetchCancellationDetails(
  serviceOrderId: number,
  userId: number,
): Promise<CancellationDetailsResponse> {
  const url = `${MPS_SERVICE_BASE_URL}/cancellation-details/${serviceOrderId}`;
  const headers = await mpsAuthHeaders();
  const response = await axios.get<CancellationDetailsResponse>(url, {
    params: { user_id: userId },
    headers,
    timeout: 25000,
  });
  const body = response.data;
  if (!body?.success || !body.data) {
    throw new Error('Could not load cancellation details.');
  }
  return body;
}

export function getOrderCancellationErrorMessage(error: unknown): string {
  if (typeof axios.isAxiosError === 'function' && axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object' && 'message' in data) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === 'string' && msg.trim()) {
        return msg;
      }
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

import axios from 'axios';

import apiClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { MPS_CREATE_TICKET_URL } from '../../../config/env';
import { getMpsOAuthAuthorizationHeader, getMpsOAuthSession } from '../../../core/utils/mpsOAuthStorage';
import {
  ensureMpsOAuthToken,
  fetchMpsOAuthToken,
  getMpsOAuthErrorMessage,
} from '../../../services/mpsOAuth.service';
import type {
  CreateSupportTicketPayload,
  CreateSupportTicketResponse,
  SupportCategoriesResponse,
} from '../types/support.types';

export async function fetchSupportCategories(): Promise<SupportCategoriesResponse> {
  const response = await apiClient.get<SupportCategoriesResponse>(
    ENDPOINTS.SUPPORT_CATEGORIES,
  );
  const body = response.data;
  if (!body.success || !Array.isArray(body.data)) {
    throw new Error('Could not load support categories.');
  }
  return body;
}

/** `POST …/mps/auth/create-ticket` uses MPS client OAuth (not local app login JWT). */
async function createTicketHeaders(): Promise<Record<string, string>> {
  await ensureMpsOAuthToken();
  const session = await getMpsOAuthSession();
  const authHeader = getMpsOAuthAuthorizationHeader(session);

  if (!authHeader) {
    throw new Error(
      'MPS session expired. Please log out and sign in again to refresh access.',
    );
  }

  return {
    'Content-Type': 'application/json',
    Authorization: authHeader,
  };
}

async function postCreateTicket(
  payload: CreateSupportTicketPayload,
  headers: Record<string, string>,
): Promise<CreateSupportTicketResponse> {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[SupportTicket] POST', MPS_CREATE_TICKET_URL, payload);
  }

  const response = await axios.post<CreateSupportTicketResponse>(
    MPS_CREATE_TICKET_URL,
    payload,
    { headers, timeout: 25000 },
  );

  const body = response.data;
  if (!body.success) {
    throw new Error(body.message || 'Failed to create support ticket.');
  }

  return body;
}

export async function createSupportTicket(
  payload: CreateSupportTicketPayload,
): Promise<CreateSupportTicketResponse> {
  try {
    return await postCreateTicket(payload, await createTicketHeaders());
  } catch (error) {
    const isUnauthorized =
      typeof axios.isAxiosError === 'function' &&
      axios.isAxiosError(error) &&
      error.response?.status === 401;

    if (!isUnauthorized) {
      throw error;
    }

    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[SupportTicket] 401 — refreshing MPS OAuth and retrying');
    }

    try {
      await fetchMpsOAuthToken();
      return await postCreateTicket(payload, await createTicketHeaders());
    } catch (retryError) {
      throw retryError;
    }
  }
}

export function getSupportTicketErrorMessage(error: unknown): string {
  if (typeof axios.isAxiosError === 'function' && axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (typeof data?.message === 'string' && data.message.length > 0) {
      return data.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error && error.message) {
    if (error.message.includes('MPS_CLIENT_ID')) {
      return getMpsOAuthErrorMessage(error);
    }
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

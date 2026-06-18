import axios from 'axios';

import { MPS_SERVICE_BASE_URL } from '../../../config/env';
import { getMpsOAuthAuthorizationHeader, getMpsOAuthSession } from '../../../core/utils/mpsOAuthStorage';
import {
  ensureMpsOAuthToken,
  fetchMpsOAuthToken,
} from '../../../services/mpsOAuth.service';
import type {
  SubmitServiceFeedbackPayload,
  SubmitServiceFeedbackResponse,
} from '../types/serviceFeedback.types';

const SERVICE_FEEDBACK_URL = `${MPS_SERVICE_BASE_URL}/feedback`;

async function feedbackHeaders(): Promise<Record<string, string>> {
  await ensureMpsOAuthToken();
  const session = await getMpsOAuthSession();
  const authHeader = getMpsOAuthAuthorizationHeader(session);

  if (!authHeader) {
    throw new Error('Please log in again to submit feedback.');
  }

  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: authHeader,
  };
}

async function postFeedback(
  payload: SubmitServiceFeedbackPayload,
  headers: Record<string, string>,
): Promise<SubmitServiceFeedbackResponse> {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[ServiceFeedback] POST', SERVICE_FEEDBACK_URL, payload);
  }

  const response = await axios.post<SubmitServiceFeedbackResponse>(
    SERVICE_FEEDBACK_URL,
    payload,
    { headers, timeout: 25000 },
  );

  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || 'Failed to submit feedback.');
  }

  return body;
}

export async function submitServiceFeedback(
  payload: SubmitServiceFeedbackPayload,
): Promise<SubmitServiceFeedbackResponse> {
  try {
    return await postFeedback(payload, await feedbackHeaders());
  } catch (error) {
    const isUnauthorized =
      typeof axios.isAxiosError === 'function' &&
      axios.isAxiosError(error) &&
      error.response?.status === 401;

    if (!isUnauthorized) {
      throw error;
    }

    await fetchMpsOAuthToken();
    return await postFeedback(payload, await feedbackHeaders());
  }
}

export function getServiceFeedbackErrorMessage(error: unknown): string {
  if (typeof axios.isAxiosError === 'function' && axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object' && 'message' in data) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === 'string' && msg.trim()) {
        return msg;
      }
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Could not submit feedback. Please try again.';
}

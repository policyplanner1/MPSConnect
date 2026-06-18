import axios from 'axios';

import {
  MPS_CLIENT_ID,
  MPS_CLIENT_SECRET,
  MPS_OAUTH_TOKEN_URL,
} from '../config/env';
import {
  buildMpsOAuthSession,
  getMpsOAuthSession,
  isMpsOAuthSessionValid,
  saveMpsOAuthSession,
  type MpsOAuthSession,
} from '../core/utils/mpsOAuthStorage';

export type MpsOAuthTokenResponse = {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    token_type?: string;
    expires_in?: string | number;
  };
};

export async function fetchMpsOAuthToken(): Promise<MpsOAuthSession> {
  if (!MPS_CLIENT_ID || !MPS_CLIENT_SECRET) {
    throw new Error(
      'MPS_CLIENT_ID and CLIENT_SECRET must be set in .env (see .env.example).',
    );
  }

  const response = await axios.post<MpsOAuthTokenResponse>(
    MPS_OAUTH_TOKEN_URL,
    {
      client_id: MPS_CLIENT_ID,
      client_secret: MPS_CLIENT_SECRET,
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 25000,
    },
  );

  const body = response.data;
  if (!body.success || !body.data?.access_token) {
    throw new Error(body.message || 'Failed to obtain MPS access token.');
  }

  const session = buildMpsOAuthSession(body.data);
  await saveMpsOAuthSession(session);
  return session;
}

/** Reuse cached token until near expiry; otherwise request a new one. */
export async function ensureMpsOAuthToken(): Promise<MpsOAuthSession> {
  const existing = await getMpsOAuthSession();
  if (isMpsOAuthSessionValid(existing)) {
    return existing!;
  }
  return fetchMpsOAuthToken();
}

export function getMpsOAuthErrorMessage(error: unknown): string {
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
    return error.message;
  }
  return 'Could not complete MPS authentication. Please try again.';
}

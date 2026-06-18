import axios, { type InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL, AUTH_API_BASE_URL } from '../../config/env';
import { getToken } from '../utils/storage';

/**
 * HTTP client for app auth routes (`/auth/login`, `/auth/signup`, …).
 * Uses `AUTH_API_BASE_URL` from `.env` when set; otherwise same as main `API_BASE_URL`.
 */
const authApiClient = axios.create({
  baseURL: AUTH_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('[Auth API] baseURL:', AUTH_API_BASE_URL);
  if (AUTH_API_BASE_URL === API_BASE_URL && /\/api\/crm\//i.test(API_BASE_URL)) {
    // eslint-disable-next-line no-console
    console.warn(
      '[Auth API] AUTH_API_BASE_URL is unset or equals CRM API_BASE_URL. Set AUTH_API_BASE_URL in .env to your Node auth server (physical device: http://<PC-LAN-IP>:5000/api/v1, not localhost), then restart Metro with --reset-cache.',
    );
  }
}

/** These routes must not send Bearer — a stale CRM JWT breaks local auth and causes 401. */
function isPublicAuthPath(url: string | undefined): boolean {
  if (!url) {
    return false;
  }
  const path = url.split('?')[0].toLowerCase();
  return (
    path.includes('/auth/login') ||
    path.includes('/auth/signup') ||
    path.includes('/auth/forgot-password') ||
    path.includes('/auth/resend-otp') ||
    path.includes('/auth/verify-otp') ||
    path.includes('/auth/reset-password')
  );
}

function clearAuthorizationHeader(config: InternalAxiosRequestConfig) {
  const h = config.headers;
  if (!h) {
    return;
  }
  if (typeof (h as { delete?: (key: string) => void }).delete === 'function') {
    (h as { delete: (key: string) => void }).delete('Authorization');
    (h as { delete: (key: string) => void }).delete('authorization');
  } else {
    const plain = h as Record<string, unknown>;
    delete plain.Authorization;
    delete plain.authorization;
  }
}

function setAuthorizationHeader(config: InternalAxiosRequestConfig, value: string) {
  if (config.headers && typeof (config.headers as { set?: unknown }).set === 'function') {
    (config.headers as { set: (k: string, v: string) => void }).set('Authorization', value);
  } else {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = value;
  }
}

authApiClient.interceptors.request.use(async config => {
  if (isPublicAuthPath(config.url)) {
    clearAuthorizationHeader(config);
    if (__DEV__) {
      const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
      // eslint-disable-next-line no-console
      console.log('[Auth API] public (no Authorization):', url);
    }
    return config;
  }

  const token = await getToken();
  if (token) {
    setAuthorizationHeader(config, `Bearer ${token}`);
  }

  if (__DEV__) {
    const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
    // eslint-disable-next-line no-console
    console.log('[Auth API] URL:', url);
  }

  return config;
});

export default authApiClient;

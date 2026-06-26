import axios from 'axios';

import { API_BASE_URL, DOCUMENTS_API_BASE_URL } from '../../config/env';
import { getToken } from '../utils/storage';

/**
 * HTTP client for DocVault on the local Node server (`/api/v1/documents/*`).
 * Never uses CRM `API_BASE_URL`.
 */
const documentsApiClient = axios.create({
  baseURL: DOCUMENTS_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('[Documents API] baseURL:', DOCUMENTS_API_BASE_URL);
  if (
    DOCUMENTS_API_BASE_URL === API_BASE_URL &&
    /\/api\/crm\//i.test(API_BASE_URL)
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      '[Documents API] DOCUMENTS_API_BASE_URL points at CRM. Set DOCUMENTS_API_BASE_URL or AUTH_API_BASE_URL in .env to http://<PC-IP>:5000/api/v1, then restart Metro.',
    );
  }
}

documentsApiClient.interceptors.request.use(async config => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Multipart uploads must not force application/json — RN sets the boundary.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  if (__DEV__) {
    const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
    // eslint-disable-next-line no-console
    console.log('[Documents API] URL:', url);
  }

  return config;
});

export default documentsApiClient;

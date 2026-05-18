import axios from 'axios';

import { API_BASE_URL } from '../../config/env';
import { getToken } from '../utils/storage';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('[API] baseURL:', API_BASE_URL);
}

apiClient.interceptors.request.use(async config => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (__DEV__) {
    const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
    // eslint-disable-next-line no-console
    console.log('[API] URL:', url);
    const payload = config.data ?? config.params ?? null;
    if (payload) {
      // eslint-disable-next-line no-console
      console.log('[API] Payload:', payload);
    }
  }

  return config;
});

export default apiClient;

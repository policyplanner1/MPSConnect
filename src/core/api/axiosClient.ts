import axios from 'axios';
import { API_BASE_URL } from '../../config/env';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
  const payload = config.data ?? config.params ?? null;
  console.log('[API] URL:', url);
  if (payload) {
    console.log('[API] Payload:', payload);
  }
  return config;
});

export default apiClient;

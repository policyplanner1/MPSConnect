import { API_BASE_URL } from '../../config/env';

export { API_BASE_URL };

/** API origin without `/api/v1` — used for health checks (GET /). */
export function getApiHost(): string {
  return API_BASE_URL.replace(/\/api\/v1\/?$/, '');
}

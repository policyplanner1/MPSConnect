import axios from 'axios';
import { getApiHost } from './api.config';

/** Quick reachability test (GET / on API host). */
export async function pingApiServer(): Promise<{
  ok: boolean;
  url: string;
  message: string;
}> {
  const url = `${getApiHost()}/`;
  try {
    const response = await axios.get(url, { timeout: 8000 });
    return {
      ok: response.status >= 200 && response.status < 300,
      url,
      message:
        typeof response.data?.message === 'string'
          ? response.data.message
          : 'API reachable',
    };
  } catch (error) {
    const detail =
      axios.isAxiosError(error) && error.message
        ? error.message
        : 'Request failed';
    return { ok: false, url, message: detail };
  }
}

import { API_BASE_URL as ENV_API_BASE_URL, IMAGE_BASE_URL as ENV_IMAGE_BASE_URL } from '@env';
import { Platform } from 'react-native';

/**
 * Fallback when `.env` is missing or `API_BASE_URL` is empty.
 * For a physical device, set `API_BASE_URL` in `.env` to your PC LAN IP.
 */
const DEV_MACHINE_HOST = '192.168.1.248';
const API_PORT = 5000;

function buildFallbackApiBaseUrl(): string {
  const host = DEV_MACHINE_HOST.trim();
  const origin =
    host.length > 0
      ? `http://${host}:${API_PORT}`
      : Platform.select({
          android: `http://10.0.2.2:${API_PORT}`,
          ios: `http://localhost:${API_PORT}`,
          default: `http://localhost:${API_PORT}`,
        })!;

  return `${origin}/api/v1`;
}

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

const resolvedApiBaseUrl = normalizeBaseUrl(ENV_API_BASE_URL ?? '');
const resolvedImageBaseUrl = normalizeBaseUrl(ENV_IMAGE_BASE_URL ?? '');

export const API_BASE_URL =
  resolvedApiBaseUrl.length > 0 ? resolvedApiBaseUrl : buildFallbackApiBaseUrl();

export const IMAGE_BASE_URL = resolvedImageBaseUrl;

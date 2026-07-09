import {
  API_BASE_URL as ENV_API_BASE_URL,
  AUTH_API_BASE_URL as ENV_AUTH_API_BASE_URL,
  DOCUMENTS_API_BASE_URL as ENV_DOCUMENTS_API_BASE_URL,
  CLIENT_SECRET as ENV_CLIENT_SECRET,
  IMAGE_BASE_URL as ENV_IMAGE_BASE_URL,
  MPS_CLIENT_ID as ENV_MPS_CLIENT_ID,
  MPS_OAUTH_TOKEN_URL as ENV_MPS_OAUTH_TOKEN_URL,
  MPS_SERVICE_ENQUIRY_URL as ENV_MPS_SERVICE_ENQUIRY_URL,
  MPS_SERVICE_CART_URL as ENV_MPS_SERVICE_CART_URL,
  MPS_SUPPORT_TICKETS_URL as ENV_MPS_SUPPORT_TICKETS_URL,
  CRM_ENQUIRY_USER_ID as ENV_CRM_ENQUIRY_USER_ID,
  FORCE_SERVICE_FEEDBACK as ENV_FORCE_SERVICE_FEEDBACK,
} from '@env';
import { Platform } from 'react-native';

/**
 * Deployed Node API base (auth, addresses, DocVault, banners).
 * Set `AUTH_API_BASE_URL` in `.env` — e.g. https://mpsconnect.thempstech.com/api/v1
 */
export const DEPLOYED_NODE_API_URL = 'https://mpsconnect.thempstech.com/api/v1';

/**
 * Fallback when `.env` is missing or `API_BASE_URL` is empty.
 * For local dev, set `AUTH_API_BASE_URL` in `.env` to your PC LAN IP or use DEPLOYED_NODE_API_URL.
 */
const DEV_MACHINE_HOST = '192.168.1.169';
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

/**
 * Metro often caches old `react-native-dotenv` values; phones also cannot use
 * `localhost` (that is the device itself). In __DEV__, map loopback → `DEV_MACHINE_HOST`.
 */
function maybeRewriteAuthLocalLoopback(url: string): string {
  if (!__DEV__) {
    return url;
  }
  const replacementHost = DEV_MACHINE_HOST.trim();
  if (!replacementHost) {
    return url;
  }
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      return url;
    }
    const portPart = parsed.port ? `:${parsed.port}` : '';
    return normalizeBaseUrl(
      `${parsed.protocol}//${replacementHost}${portPart}${parsed.pathname}${parsed.search}`,
    );
  } catch {
    return url;
  }
}

function maybeRewriteImageLocalLoopback(url: string): string {
  if (!__DEV__) {
    return url;
  }
  const replacementHost = DEV_MACHINE_HOST.trim();
  if (!replacementHost) {
    return url;
  }
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      return url;
    }
    const portPart = parsed.port ? `:${parsed.port}` : '';
    return normalizeBaseUrl(`${parsed.protocol}//${replacementHost}${portPart}`);
  } catch {
    return url;
  }
}

function trimEnv(value: string | undefined): string {
  return (value ?? '').trim();
}

const resolvedApiBaseUrl = normalizeBaseUrl(ENV_API_BASE_URL ?? '');
const resolvedImageBaseUrl = normalizeBaseUrl(ENV_IMAGE_BASE_URL ?? '');
const resolvedAuthApiBaseUrl = normalizeBaseUrl(ENV_AUTH_API_BASE_URL ?? '');

export const API_BASE_URL =
  resolvedApiBaseUrl.length > 0 ? resolvedApiBaseUrl : buildFallbackApiBaseUrl();

/**
 * Base URL for `/auth/*` (login, signup, forgot password, etc.).
 * When unset in `.env`, falls back to `API_BASE_URL` so existing setups keep working.
 */
const authBaseCandidate =
  resolvedAuthApiBaseUrl.length > 0 ? resolvedAuthApiBaseUrl : API_BASE_URL;
export const AUTH_API_BASE_URL = maybeRewriteAuthLocalLoopback(authBaseCandidate);

/**
 * DocVault — local Node server only (`/api/v1/documents/*`), not CRM.
 * Defaults to `AUTH_API_BASE_URL`, then dev fallback `http://<host>:5000/api/v1`.
 */
const documentsBaseCandidate =
  trimEnv(ENV_DOCUMENTS_API_BASE_URL).length > 0
    ? trimEnv(ENV_DOCUMENTS_API_BASE_URL)
    : resolvedAuthApiBaseUrl.length > 0
      ? resolvedAuthApiBaseUrl
      : buildFallbackApiBaseUrl();

export const DOCUMENTS_API_BASE_URL = maybeRewriteAuthLocalLoopback(
  normalizeBaseUrl(documentsBaseCandidate),
);

export const IMAGE_BASE_URL = maybeRewriteImageLocalLoopback(resolvedImageBaseUrl);

/** `https://…/api/crm/v1` → `https://…/api/crm/mps/auth/oauth/token` */
function defaultMpsOAuthTokenUrlFromApiBase(apiBase: string): string {
  const base = apiBase.replace(/\/+$/, '');
  if (/\/api\/crm\/v1$/i.test(base)) {
    return base.replace(/\/api\/crm\/v1$/i, '/api/crm/mps/auth/oauth/token');
  }
  return 'https://rewardplanners.com/api/crm/mps/auth/oauth/token';
}

const resolvedMpsOAuthTokenUrl = trimEnv(ENV_MPS_OAUTH_TOKEN_URL);

export const MPS_OAUTH_TOKEN_URL =
  resolvedMpsOAuthTokenUrl.length > 0
    ? normalizeBaseUrl(resolvedMpsOAuthTokenUrl)
    : defaultMpsOAuthTokenUrlFromApiBase(API_BASE_URL);

export const MPS_CLIENT_ID = trimEnv(ENV_MPS_CLIENT_ID);
/** From `.env` key `CLIENT_SECRET` (MPS client secret). */
export const MPS_CLIENT_SECRET = trimEnv(ENV_CLIENT_SECRET);

/**
 * MPS service enquiry — mounted under CRM v1 like `/service/details`.
 * `https://…/api/crm/v1` → `https://…/api/crm/v1/mps/service-enquiry`
 * (not `/api/crm/mps/…`, which returns "route not found" on CRM).
 */
function defaultMpsServiceEnquiryUrlFromApiBase(apiBase: string): string {
  const base = apiBase.replace(/\/+$/, '');
  if (/\/api\/crm\/v1$/i.test(base)) {
    return base.replace(/\/api\/crm\/v1$/i, '/api/crm/mps/service/enquiry');
  }
  return 'https://rewardplanners.com/api/crm/mps/service/enquiry';
}

const resolvedMpsServiceEnquiryUrl = trimEnv(ENV_MPS_SERVICE_ENQUIRY_URL);

export const MPS_SERVICE_ENQUIRY_URL =
  resolvedMpsServiceEnquiryUrl.length > 0
    ? normalizeBaseUrl(resolvedMpsServiceEnquiryUrl)
    : defaultMpsServiceEnquiryUrlFromApiBase(API_BASE_URL);

/** MPS service cart — `GET/POST …/api/crm/mps/service/cart/*` */
function defaultMpsServiceCartUrlFromApiBase(apiBase: string): string {
  const base = apiBase.replace(/\/+$/, '');
  if (/\/api\/crm\/v1$/i.test(base)) {
    return base.replace(/\/api\/crm\/v1$/i, '/api/crm/mps/service/cart');
  }
  return 'https://rewardplanners.com/api/crm/mps/service/cart';
}

const resolvedMpsServiceCartUrl = trimEnv(ENV_MPS_SERVICE_CART_URL);

export const MPS_SERVICE_CART_URL =
  resolvedMpsServiceCartUrl.length > 0
    ? normalizeBaseUrl(resolvedMpsServiceCartUrl)
    : defaultMpsServiceCartUrlFromApiBase(API_BASE_URL);

/** `…/api/crm/mps/service` — place order, create-order, verify-payment, etc. */
export const MPS_SERVICE_BASE_URL = MPS_SERVICE_CART_URL.replace(/\/cart\/?$/i, '');

/** MPS create support ticket — `POST …/api/crm/mps/auth/create-ticket` */
function defaultMpsCreateTicketUrlFromApiBase(apiBase: string): string {
  const base = apiBase.replace(/\/+$/, '');
  if (/\/api\/crm\/v1$/i.test(base)) {
    return base.replace(/\/api\/crm\/v1$/i, '/api/crm/mps/auth/create-ticket');
  }
  return 'https://rewardplanners.com/api/crm/mps/auth/create-ticket';
}

const resolvedMpsCreateTicketUrl = trimEnv(ENV_MPS_SUPPORT_TICKETS_URL);

export const MPS_CREATE_TICKET_URL =
  resolvedMpsCreateTicketUrl.length > 0
    ? normalizeBaseUrl(resolvedMpsCreateTicketUrl)
    : defaultMpsCreateTicketUrlFromApiBase(API_BASE_URL);

/** @deprecated Use `MPS_CREATE_TICKET_URL` */
export const MPS_SUPPORT_TICKETS_URL = MPS_CREATE_TICKET_URL;

/** Default delivery address for `POST …/service/cart` place-order. */
export const DEFAULT_SERVICE_ADDRESS_ID = 1;

/** Relative path when using `apiClient` (same host as `API_BASE_URL`). */
export const MPS_SERVICE_ENQUIRY_PATH = '/mps/service/enquiry';

/** Optional numeric CRM user id for enquiries when login only provides a local cuid. */
const resolvedCrmEnquiryUserId = trimEnv(ENV_CRM_ENQUIRY_USER_ID);
export const CRM_ENQUIRY_USER_ID =
  resolvedCrmEnquiryUserId.length > 0 && /^\d+$/.test(resolvedCrmEnquiryUserId)
    ? parseInt(resolvedCrmEnquiryUserId, 10)
    : null;

const resolvedForceServiceFeedback = trimEnv(ENV_FORCE_SERVICE_FEEDBACK).toLowerCase();

/** When true (dev), order details always shows the feedback form for UI/API testing. */
export const FORCE_SERVICE_FEEDBACK =
  resolvedForceServiceFeedback === 'true' || resolvedForceServiceFeedback === '1';

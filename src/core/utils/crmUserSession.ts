import apiClient from '../api/axiosClient';
import { CRM_ENQUIRY_USER_ID } from '../../config/env';
import { getToken, saveCrmUserId, getCrmUserId } from './storage';

type JwtPayload = Record<string, unknown>;

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const segment = token.split('.')[1];
    if (!segment || typeof globalThis.atob !== 'function') {
      return null;
    }
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(globalThis.atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

export function parseNumericUserId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      const n = parseInt(trimmed, 10);
      return n > 0 ? n : null;
    }
  }
  return null;
}

/** CRM numeric id from login `data` (not local Prisma cuid in `id`). */
export function extractCrmUserIdFromLoginData(
  data: Record<string, unknown> | undefined | null,
): number | null {
  if (!data) {
    return null;
  }
  const candidates = [
    data.crm_user_id,
    data.crmUserId,
    data.user_id,
    data.userId,
    data.id,
  ];
  for (const raw of candidates) {
    const n = parseNumericUserId(raw);
    if (n != null) {
      return n;
    }
  }
  return null;
}

export function extractCrmUserIdFromJwt(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }
  const candidates = [
    payload.crm_user_id,
    payload.crmUserId,
    payload.user_id,
    payload.userId,
  ];
  for (const raw of candidates) {
    const n = parseNumericUserId(raw);
    if (n != null) {
      return n;
    }
  }
  return null;
}

function extractIdFromProfileBody(body: unknown): number | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const root = body as Record<string, unknown>;
  const data = root.data;
  const candidates: unknown[] = [root.id, root.user_id];

  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    candidates.push(d.id, d.user_id, d.userId, d.crm_user_id);
    if (d.user && typeof d.user === 'object') {
      const u = d.user as Record<string, unknown>;
      candidates.push(u.id, u.user_id);
    }
  }

  for (const raw of candidates) {
    const n = parseNumericUserId(raw);
    if (n != null) {
      return n;
    }
  }
  return null;
}

const CRM_PROFILE_PATHS = [
  '/user/me',
  '/auth/me',
  '/profile',
  '/users/me',
  '/mps/user/me',
];

/** Try CRM profile routes to obtain numeric `user_id` for enquiries. */
export async function trySyncCrmUserIdFromProfile(): Promise<number | null> {
  const existing = await getCrmUserId();
  if (existing != null) {
    return existing;
  }

  const token = await getToken();
  if (!token) {
    return null;
  }

  const fromJwt = extractCrmUserIdFromJwt(token);
  if (fromJwt != null) {
    await saveCrmUserId(fromJwt);
    return fromJwt;
  }

  if (CRM_ENQUIRY_USER_ID != null) {
    await saveCrmUserId(CRM_ENQUIRY_USER_ID);
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(
        '[CRM] Using CRM_ENQUIRY_USER_ID from .env — local login id is not a CRM integer.',
      );
    }
    return CRM_ENQUIRY_USER_ID;
  }

  for (const path of CRM_PROFILE_PATHS) {
    try {
      const response = await apiClient.get(path);
      const id = extractIdFromProfileBody(response.data);
      if (id != null) {
        await saveCrmUserId(id);
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('[CRM] user_id resolved from', path, '→', id);
        }
        return id;
      }
    } catch {
      // try next path
    }
  }

  return null;
}

/**
 * Numeric Reward Planners `user_id` for `/mps/service-enquiry`.
 * Local auth ids (cuid) must never be sent — CRM DB column is INTEGER.
 */
export async function getCrmEnquiryUserId(): Promise<number | null> {
  const stored = await getCrmUserId();
  if (stored != null) {
    return stored;
  }
  return trySyncCrmUserIdFromProfile();
}

export function getCrmUserIdLinkErrorMessage(): string {
  return [
    'Your login is on the app server, but service enquiry needs a numeric Reward Planners CRM user id.',
    'Local login ids (e.g. cmp6id…) cannot be sent to CRM.',
    '',
    'For testing, add CRM_ENQUIRY_USER_ID=1 to .env (your CRM user id), restart Metro, and log in again.',
    'For production, use CRM login or ask backend to return crm_user_id on login.',
  ].join('\n');
}

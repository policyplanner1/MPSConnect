import { getToken, getStoredUserId, saveUserId } from './storage';

type JwtPayload = {
  id?: string | number;
  sub?: string | number;
  user_id?: string | number;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) {
      return null;
    }
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    if (typeof globalThis.atob !== 'function') {
      return null;
    }
    const json = globalThis.atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function idFromJwtPayload(payload: JwtPayload): string | null {
  const raw = payload.id ?? payload.user_id ?? payload.sub;
  if (raw == null) {
    return null;
  }
  const s = String(raw).trim();
  return s.length > 0 ? s : null;
}

/** Read login `data` whether API returns `id`, `userId`, or `user_id`. */
export function extractUserIdFromLoginData(
  data: Record<string, unknown> | undefined | null,
): string | null {
  if (!data) {
    return null;
  }
  const raw = data.id ?? data.userId ?? data.user_id;
  if (raw == null) {
    return null;
  }
  const s = String(raw).trim();
  return s.length > 0 ? s : null;
}

/** Persist user id from JWT when missing (e.g. logged in before we saved id). */
export async function ensureUserIdStored(): Promise<string | null> {
  const existing = await getStoredUserId();
  if (existing) {
    return existing;
  }

  const token = await getToken();
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  const id = idFromJwtPayload(payload);
  if (id) {
    await saveUserId(id);
  }
  return id;
}

/** @deprecated Use `getCrmEnquiryUserId` from `crmUserSession.ts` for service enquiry. */
export async function getEnquiryUserId(): Promise<number | null> {
  const { getCrmEnquiryUserId } = await import('./crmUserSession');
  return getCrmEnquiryUserId();
}

import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'MPS_CLIENT_OAUTH_SESSION';

export type MpsOAuthSession = {
  accessToken: string;
  tokenType: string;
  expiresAtMs: number;
};

export async function saveMpsOAuthSession(session: MpsOAuthSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getMpsOAuthSession(): Promise<MpsOAuthSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as MpsOAuthSession;
  } catch {
    return null;
  }
}

export async function removeMpsOAuthSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export function isMpsOAuthSessionValid(
  session: MpsOAuthSession | null | undefined,
): boolean {
  if (!session?.accessToken) {
    return false;
  }
  return Date.now() < session.expiresAtMs - 60_000;
}

/** Parses `expires_in` from API (e.g. `"30d"`, `"3600"`, or seconds as number). */
export function parseExpiresInToMs(expiresIn: string | number | undefined): number {
  if (expiresIn === undefined || expiresIn === null) {
    return Date.now() + 30 * 24 * 60 * 60 * 1000;
  }
  if (typeof expiresIn === 'number' && expiresIn > 0) {
    return Date.now() + expiresIn * 1000;
  }
  const s = String(expiresIn).trim().toLowerCase();
  const day = s.match(/^(\d+)d$/);
  if (day) {
    return Date.now() + parseInt(day[1], 10) * 24 * 60 * 60 * 1000;
  }
  const hour = s.match(/^(\d+)h$/);
  if (hour) {
    return Date.now() + parseInt(hour[1], 10) * 60 * 60 * 1000;
  }
  const min = s.match(/^(\d+)m$/);
  if (min) {
    return Date.now() + parseInt(min[1], 10) * 60 * 1000;
  }
  const num = Number(s);
  if (!Number.isNaN(num) && num > 0) {
    return Date.now() + num * 1000;
  }
  return Date.now() + 30 * 24 * 60 * 60 * 1000;
}

export function buildMpsOAuthSession(data: {
  access_token: string;
  token_type?: string;
  expires_in?: string | number;
}): MpsOAuthSession {
  return {
    accessToken: data.access_token,
    tokenType: String(data.token_type ?? 'Bearer').trim() || 'Bearer',
    expiresAtMs: parseExpiresInToMs(data.expires_in),
  };
}

export function getMpsOAuthAuthorizationHeader(
  session: MpsOAuthSession | null,
): string | null {
  if (!session?.accessToken || !isMpsOAuthSessionValid(session)) {
    return null;
  }
  const type = session.tokenType || 'Bearer';
  return `${type} ${session.accessToken}`;
}

import type { LoginResponse } from '../../services/auth.service';
import { getMpsOAuthSession } from './mpsOAuthStorage';
import { getRememberedEmail, getToken } from './storage';

const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';
const MPS_SESSION_KEY = 'MPS_CLIENT_OAUTH_SESSION';
const REMEMBERED_EMAIL_KEY = 'REMEMBERED_EMAIL';

function formatExpiry(expiresAtMs: number): string {
  return new Date(expiresAtMs).toISOString();
}

/** Dev-only: log login API body and current AsyncStorage auth keys. */
export async function logLoginStorageDebug(
  step: string,
  loginResponse?: LoginResponse,
): Promise<void> {
  if (!__DEV__) {
    return;
  }

  if (loginResponse) {
    // eslint-disable-next-line no-console
    console.log(`[Login] ${step} — API response:`, JSON.stringify(loginResponse, null, 2));
  }

  const [userToken, mpsSession, rememberedEmail] = await Promise.all([
    getToken(),
    getMpsOAuthSession(),
    getRememberedEmail(),
  ]);

  const localSnapshot = {
    [ACCESS_TOKEN_KEY]: userToken,
    [MPS_SESSION_KEY]: mpsSession
      ? {
          ...mpsSession,
          expiresAt: formatExpiry(mpsSession.expiresAtMs),
        }
      : null,
    [REMEMBERED_EMAIL_KEY]: rememberedEmail,
  };

  // eslint-disable-next-line no-console
  console.log(`[Login] ${step} — saved in AsyncStorage:`, JSON.stringify(localSnapshot, null, 2));
}

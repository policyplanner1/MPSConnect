import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';
const USER_ID_KEY = 'USER_ID';
/** Numeric Reward Planners CRM user id (INTEGER) for MPS enquiries. */
const CRM_USER_ID_KEY = 'CRM_USER_ID';
const REMEMBERED_EMAIL_KEY = 'REMEMBERED_EMAIL';

export const saveToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
};

export const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const saveUserId = async (userId: number | string): Promise<void> => {
  await AsyncStorage.setItem(USER_ID_KEY, String(userId));
};

/** Stored login user id (string — may be numeric or cuid). */
export const getStoredUserId = async (): Promise<string | null> => {
  const raw = await AsyncStorage.getItem(USER_ID_KEY);
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/** @deprecated Use `getStoredUserId` or `getEnquiryUserId` from `authSession.ts`. */
export const getUserId = async (): Promise<number | null> => {
  const raw = await getStoredUserId();
  if (!raw || !/^\d+$/.test(raw)) {
    return null;
  }
  return parseInt(raw, 10);
};

export const removeUserId = async (): Promise<void> => {
  await AsyncStorage.removeItem(USER_ID_KEY);
};

export const saveCrmUserId = async (userId: number): Promise<void> => {
  await AsyncStorage.setItem(CRM_USER_ID_KEY, String(userId));
};

export const getCrmUserId = async (): Promise<number | null> => {
  const raw = await AsyncStorage.getItem(CRM_USER_ID_KEY);
  if (!raw || !/^\d+$/.test(raw.trim())) {
    return null;
  }
  const n = parseInt(raw.trim(), 10);
  return n > 0 ? n : null;
};

export const removeCrmUserId = async (): Promise<void> => {
  await AsyncStorage.removeItem(CRM_USER_ID_KEY);
};

export const saveRememberedEmail = async (email: string): Promise<void> => {
  await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email);
};

export const getRememberedEmail = async (): Promise<string | null> => {
  return AsyncStorage.getItem(REMEMBERED_EMAIL_KEY);
};

export const clearRememberedEmail = async (): Promise<void> => {
  await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
};

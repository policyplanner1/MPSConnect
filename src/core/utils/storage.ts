import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';
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

export const saveRememberedEmail = async (email: string): Promise<void> => {
  await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email);
};

export const getRememberedEmail = async (): Promise<string | null> => {
  return AsyncStorage.getItem(REMEMBERED_EMAIL_KEY);
};

export const clearRememberedEmail = async (): Promise<void> => {
  await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
};

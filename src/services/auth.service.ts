import axios from 'axios';
import { API_BASE_URL } from '../core/api/api.config';
import API from '../core/api/axiosClient';

export type SignupPayload = {
  name: string;
  email: string;
  contactNumber: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginUserData = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  token: string;
  data: LoginUserData;
};

export type AuthApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

export type SignupUserData = {
  id: string;
  name: string;
  email: string;
};

export const signupUser = async (
  data: SignupPayload,
): Promise<AuthApiResponse<SignupUserData>> => {
  const response = await API.post<AuthApiResponse<SignupUserData>>(
    '/auth/signup',
    data,
  );
  return response.data;
};

export const loginUser = async (data: LoginPayload): Promise<LoginResponse> => {
  const response = await API.post<LoginResponse>('/auth/login', data);
  return response.data;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type VerifyOtpPayload = {
  email: string;
  otp: string;
};

export type ResetPasswordPayload = {
  email: string;
  otp: string;
  password: string;
};

export const requestForgotPassword = async (
  data: ForgotPasswordPayload,
): Promise<AuthApiResponse<{ email: string; expiresInMinutes: number }>> => {
  const response = await API.post<
    AuthApiResponse<{ email: string; expiresInMinutes: number }>
  >('/auth/forgot-password', data);
  return response.data;
};

export const resendForgotPasswordOtp = async (
  data: ForgotPasswordPayload,
): Promise<AuthApiResponse<{ email: string; expiresInMinutes: number }>> => {
  const response = await API.post<
    AuthApiResponse<{ email: string; expiresInMinutes: number }>
  >('/auth/resend-otp', data);
  return response.data;
};

export const verifyForgotPasswordOtp = async (
  data: VerifyOtpPayload,
): Promise<AuthApiResponse<{ email: string }>> => {
  const response = await API.post<AuthApiResponse<{ email: string }>>(
    '/auth/verify-otp',
    data,
  );
  return response.data;
};

export const resetPasswordWithOtp = async (
  data: ResetPasswordPayload,
): Promise<AuthApiResponse> => {
  const response = await API.post<AuthApiResponse>('/auth/reset-password', data);
  return response.data;
};

export function getAuthErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      const isNetwork =
        error.code === 'ERR_NETWORK' ||
        error.message === 'Network Error' ||
        error.message.includes('Network Error');

      if (isNetwork) {
        return [
          'Cannot reach the API server.',
          '',
          `Trying: ${API_BASE_URL}`,
          '',
          '• Backend running? cd backend-api && npm run dev',
          '• Phone on same Wi‑Fi as PC',
          '• Windows: allow inbound TCP 5000 (Firewall)',
          '• Physical device: DEV_MACHINE_HOST in api.config.ts = PC IPv4',
          '• Android emulator: set DEV_MACHINE_HOST to "" (uses 10.0.2.2)',
          '• Rebuild app after native changes (npx react-native run-android)',
        ].join('\n');
      }
    }

    const data = error.response?.data as { message?: string } | undefined;
    if (typeof data?.message === 'string' && data.message.length > 0) {
      return data.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

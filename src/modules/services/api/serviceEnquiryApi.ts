import axios from 'axios';

import { MPS_SERVICE_ENQUIRY_URL } from '../../../config/env';
import { getMpsOAuthAuthorizationHeader, getMpsOAuthSession } from '../../../core/utils/mpsOAuthStorage';
import { ensureMpsOAuthToken } from '../../../services/mpsOAuth.service';
import { normalizeMobileDigits } from '../utils/enquiryValidation';

export type ServiceEnquiryPayload = {
  user_id: number;
  service_id: number;
  variant_id: number;
  name: string;
  city: string;
  mobile: string;
  email: string;
  enquiry_data: {
    enquiry_type: string;
    message: string;
  };
};

export type ServiceEnquiryResponse = {
  success: boolean;
  message: string;
  data: {
    id: number;
    enquiry_ref: string;
  };
};

export function mapFormToEnquiryPayload(
  values: Record<string, string>,
  serviceId: number,
  variantId: number,
  userId: number,
): ServiceEnquiryPayload {
  const pick = (...keys: string[]): string => {
    for (const key of keys) {
      const v = values[key]?.trim();
      if (v) {
        return v;
      }
    }
    return '';
  };

  const mobileRaw = pick('mobile', 'mobile_number', 'phone', 'contact_number');

  return {
    user_id: userId,
    service_id: serviceId,
    variant_id: variantId,
    name: pick('name', 'full_name', 'customer_name'),
    city: pick('city'),
    mobile:
      mobileRaw.replace(/\D/g, '').length >= 10
        ? normalizeMobileDigits(mobileRaw)
        : mobileRaw,
    email: pick('email', 'email_id').toLowerCase(),
    enquiry_data: {
      enquiry_type: 'general',
      message:
        pick('message', 'comments', 'enquiry', 'description') ||
        'I am interested in your services. Please contact me.',
    },
  };
}

export async function submitServiceEnquiry(
  payload: ServiceEnquiryPayload,
): Promise<ServiceEnquiryResponse> {
  await ensureMpsOAuthToken();
  const session = await getMpsOAuthSession();
  const authHeader = getMpsOAuthAuthorizationHeader(session);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[ServiceEnquiry] POST', MPS_SERVICE_ENQUIRY_URL, payload);
  }

  const response = await axios.post<ServiceEnquiryResponse>(
    MPS_SERVICE_ENQUIRY_URL,
    payload,
    { headers, timeout: 25000 },
  );

  const body = response.data;
  if (!body.success) {
    throw new Error(body.message || 'Failed to submit enquiry.');
  }

  return body;
}

export function getServiceEnquiryErrorMessage(error: unknown): string {
  if (typeof axios.isAxiosError === 'function' && axios.isAxiosError(error)) {
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
  return 'Could not submit your enquiry. Please try again.';
}

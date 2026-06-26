import axios from 'axios';

import { MPS_SERVICE_ENQUIRY_URL } from '../../../config/env';
import { getMpsOAuthAuthorizationHeader, getMpsOAuthSession } from '../../../core/utils/mpsOAuthStorage';
import { ensureMpsOAuthToken } from '../../../services/mpsOAuth.service';
import { extractContactFromForm } from '../utils/serviceContact';

export type ServiceEnquiryPayload = {
  user_id: number;
  service_id: number;
  variant_id: number;
  name: string;
  city: string;
  mobile: string;
  email: string;
  message: string;
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
  const contact = extractContactFromForm(values);

  return {
    user_id: userId,
    service_id: serviceId,
    variant_id: variantId,
    name: contact.name,
    city: contact.city,
    mobile: contact.mobile,
    email: contact.email,
    message: contact.message,
    enquiry_data: {
      enquiry_type: 'general',
      message: contact.message,
    },
  };
}

export function validateEnquiryPayload(payload: ServiceEnquiryPayload): string | null {
  if (!payload.user_id || payload.user_id < 1) {
    return 'Please log in again to submit your enquiry.';
  }
  if (!payload.service_id || payload.service_id < 1) {
    return 'Service is missing. Please go back and open the service again.';
  }
  if (!payload.variant_id || payload.variant_id < 1) {
    return 'Please select a service plan before submitting.';
  }
  if (!payload.name.trim()) {
    return 'Name is required.';
  }
  if (!payload.mobile.trim()) {
    return 'Mobile number is required.';
  }
  return null;
}

export async function submitServiceEnquiry(
  payload: ServiceEnquiryPayload,
): Promise<ServiceEnquiryResponse> {
  const validationError = validateEnquiryPayload(payload);
  if (validationError) {
    throw new Error(validationError);
  }

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

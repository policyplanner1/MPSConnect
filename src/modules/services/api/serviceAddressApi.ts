import authApi from '../../../core/api/authAxiosClient';
import type {
  ServiceAddress,
  ServiceAddressInput,
  ServiceAddressListResponse,
  ServiceAddressMutationResponse,
} from '../types/serviceAddress.types';

export async function fetchServiceAddresses(): Promise<ServiceAddress[]> {
  const response = await authApi.get<ServiceAddressListResponse>('/addresses');
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to load addresses');
  }
  return response.data.data ?? [];
}

export async function createServiceAddress(
  input: ServiceAddressInput,
): Promise<ServiceAddress> {
  const response = await authApi.post<ServiceAddressMutationResponse>('/addresses', input);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to save address');
  }
  return response.data.data;
}

export async function updateServiceAddress(
  addressId: number,
  input: ServiceAddressInput,
): Promise<ServiceAddress> {
  const response = await authApi.put<ServiceAddressMutationResponse>(
    `/addresses/${addressId}`,
    input,
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to update address');
  }
  return response.data.data;
}

export async function setDefaultServiceAddress(addressId: number): Promise<ServiceAddress> {
  const response = await authApi.patch<ServiceAddressMutationResponse>(
    `/addresses/${addressId}/default`,
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to set default address');
  }
  return response.data.data;
}

export async function deleteServiceAddress(addressId: number): Promise<void> {
  const response = await authApi.delete<{ success: boolean; message?: string }>(
    `/addresses/${addressId}`,
  );
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to delete address');
  }
}

export function getServiceAddressErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: { message?: string } } }).response?.data;
    if (data?.message) {
      return data.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

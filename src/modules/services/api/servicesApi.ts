import apiClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { ServiceByCategoryResponse, ServiceDetailsResponse } from '../types/service.types';

export const fetchServicesByCategory = async (
  categoryId: number,
): Promise<ServiceByCategoryResponse> => {
  const response = await apiClient.get<ServiceByCategoryResponse>(
    ENDPOINTS.SERVICES_BY_CATEGORY(categoryId),
  );
  return response.data;
};

export const fetchServiceDetails = async (
  serviceId: number,
): Promise<ServiceDetailsResponse> => {
  const response = await apiClient.get<ServiceDetailsResponse>(
    ENDPOINTS.SERVICE_DETAILS(serviceId),
  );
  return response.data;
};

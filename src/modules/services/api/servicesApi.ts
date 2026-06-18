import apiClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { RelatedServicesResponse } from '../types/relatedService.types';
import { ServiceHomeResponse } from '../types/serviceHome.types';
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

export const fetchServiceHome = async (): Promise<ServiceHomeResponse> => {
  const response = await apiClient.get<ServiceHomeResponse>(ENDPOINTS.SERVICE_HOME);
  const body = response.data;
  if (!body.success) {
    throw new Error(body.message || 'Failed to load home services.');
  }
  return body;
};

/** Related services for checkout upsell (`GET /service/related/:serviceId`). */
export const fetchRelatedServices = async (
  serviceId: number,
): Promise<RelatedServicesResponse> => {
  const response = await apiClient.get<RelatedServicesResponse>(
    ENDPOINTS.SERVICE_RELATED(serviceId),
  );
  const body = response.data;
  if (!body.success) {
    throw new Error(body.message || 'Failed to load related services.');
  }
  return body;
};

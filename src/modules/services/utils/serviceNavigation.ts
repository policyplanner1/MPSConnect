import type { Service, ServiceDetailInfo } from '../types/service.types';

export function mapDetailInfoToService(service: ServiceDetailInfo): Service {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    price: service.price,
    estimated_days: service.estimated_days,
    service_image: service.service_image,
  };
}

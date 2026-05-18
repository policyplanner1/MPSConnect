export const ENDPOINTS = {
  SERVICES_BY_CATEGORY: (categoryId: number) =>
    `/service/by-category/${categoryId}`,
  SERVICE_DETAILS: (serviceId: number) =>
    `/service/details/${serviceId}`,
};

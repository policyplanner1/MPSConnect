export const ENDPOINTS = {
  SERVICES_BY_CATEGORY: (categoryId: number) =>
    `/service/by-category/${categoryId}`,
  SERVICE_DETAILS: (serviceId: number) =>
    `/service/details/${serviceId}`,
  SERVICE_HOME: '/service/home',
  SERVICE_RELATED: (serviceId: number) => `/service/related/${serviceId}`,
  SUPPORT_CATEGORIES: '/support/categories',
  SUPPORT_CHAT: '/support/chat',
  SUPPORT_CHAT_HISTORY: '/support/history',
};

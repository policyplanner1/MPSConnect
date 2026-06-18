export type HomeServiceItem = {
  service_id: number;
  variant_id: number;
  name: string;
  description: string;
  enquiry: number;
  price: number;
  /** Present on some API builds */
  image?: string | null;
  variant_image?: string | null;
  service_image?: string | null;
};

export type ServiceHomeData = {
  quick_services: HomeServiceItem[];
  popular: HomeServiceItem[];
  recommended: HomeServiceItem[];
  value_added: HomeServiceItem[];
};

export type ServiceHomeResponse = {
  success: boolean;
  data: ServiceHomeData;
  message?: string;
};

/** Home carousel cards use `service_image` (falls back to `variant_image`). */
export function getHomeServiceImageUrl(item: HomeServiceItem): string | null {
  const url = item.service_image ?? item.variant_image ?? item.image ?? null;
  return url && url.trim().length > 0 ? url : null;
}

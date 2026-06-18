export type RelatedServiceItem = {
  service_id: number;
  variant_id: number;
  name: string;
  enquiry: number;
  title: string;
  price: number;
  mrp?: number;
  service_image?: string | null;
  variant_image?: string | null;
  discount_percent?: number;
  coins?: number;
};

export type RelatedServicesResponse = {
  success: boolean;
  data: RelatedServiceItem[];
  message?: string;
};

export function getRelatedServiceImageUrl(item: RelatedServiceItem): string | null {
  const url = item.variant_image ?? item.service_image ?? null;
  return url && url.trim().length > 0 ? url : null;
}

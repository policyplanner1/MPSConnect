import { IMAGE_BASE_URL } from '../../../config/env';

export type ServiceHomeServiceItem = {
  service_id: number;
  variant_id: number;
  name: string;
  title: string;
  description: string;
  enquiry: boolean;
  rating: number;
  total_orders: number;
  price: number;
  mrp: number;
  discount_percent: number;
  coins: number;
  service_image: string;
  variant_image: string;
};

export type ServiceHomeBannerItem = {
  banner_id: number;
  title: string;
  image_url: string;
  redirect_type: string;
  redirect_id: number;
  redirect_url: string | null;
};

export type ServiceHomeSectionKey =
  | 'quick_services'
  | 'home_banners'
  | 'popular_services'
  | 'exclusive_offers'
  | (string & {});

export type ServiceHomeSection = {
  section_id: number;
  title: string;
  section_key: ServiceHomeSectionKey;
  layout_type: 'grid' | 'horizontal' | 'carousel' | string;
  section_type: 'services' | 'banners' | string;
  items: Array<ServiceHomeServiceItem | ServiceHomeBannerItem>;
};

export type ServiceHomeResponse = {
  success: boolean;
  data: ServiceHomeSection[];
  message?: string;
};

export function isServiceHomeBannerItem(
  item: ServiceHomeServiceItem | ServiceHomeBannerItem,
): item is ServiceHomeBannerItem {
  return 'banner_id' in item && typeof (item as ServiceHomeBannerItem).banner_id === 'number';
}

export function isServiceHomeServiceItem(
  item: ServiceHomeServiceItem | ServiceHomeBannerItem,
): item is ServiceHomeServiceItem {
  return 'service_id' in item && typeof (item as ServiceHomeServiceItem).service_id === 'number';
}

export function getServiceHomeItemImageUrl(
  item: ServiceHomeServiceItem | ServiceHomeBannerItem,
): string | null {
  if (isServiceHomeBannerItem(item)) {
    const url = item.image_url?.trim();
    return url || null;
  }
  const url = (item.variant_image || item.service_image || '').trim();
  return url || null;
}

export function resolveServiceHomeImageUrl(uri: string | null | undefined): string | null {
  if (!uri || typeof uri !== 'string') {
    return null;
  }
  const trimmed = uri.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.startsWith('http')) {
    return trimmed;
  }
  const base = (IMAGE_BASE_URL ?? '').replace(/\/+$/, '');
  if (!base) {
    return trimmed;
  }
  return `${base}/${trimmed.replace(/^\//, '')}`;
}

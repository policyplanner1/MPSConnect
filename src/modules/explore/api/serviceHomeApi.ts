import axios from 'axios';

import { API_BASE_URL } from '../../../config/env';
import type {
  ServiceHomeBannerItem,
  ServiceHomeResponse,
  ServiceHomeSection,
  ServiceHomeSectionKey,
  ServiceHomeServiceItem,
} from '../types/serviceHome.types';
import { isServiceHomeBannerItem, isServiceHomeServiceItem } from '../types/serviceHome.types';

function getServiceHomeUrl(): string {
  const base = API_BASE_URL.replace(/\/+$/, '');
  if (/\/api\/crm\/v1$/i.test(base)) {
    return `${base}/service/home`;
  }
  return 'https://rewardplanners.com/api/crm/v1/service/home';
}

export function getServiceHomeApiUrl(): string {
  return getServiceHomeUrl();
}

export async function fetchServiceHome(): Promise<ServiceHomeSection[]> {
  const { data } = await axios.get<ServiceHomeResponse>(getServiceHomeUrl(), {
    headers: { Accept: 'application/json' },
    timeout: 20000,
  });

  if (!data?.success || !Array.isArray(data.data)) {
    throw new Error(data?.message || 'Failed to load home sections.');
  }

  return data.data;
}

export function findServiceHomeSection(
  sections: ServiceHomeSection[],
  sectionKey: ServiceHomeSectionKey,
): ServiceHomeSection | undefined {
  return sections.find(section => section.section_key === sectionKey);
}

export function getServiceHomeBannerItems(
  sections: ServiceHomeSection[],
): ServiceHomeBannerItem[] {
  const section = findServiceHomeSection(sections, 'home_banners');
  if (!section?.items?.length) {
    return [];
  }
  return section.items.filter(isServiceHomeBannerItem);
}

export function getServiceHomeServiceItems(
  sections: ServiceHomeSection[],
  sectionKey: ServiceHomeSectionKey,
): ServiceHomeServiceItem[] {
  const section = findServiceHomeSection(sections, sectionKey);
  if (!section?.items?.length) {
    return [];
  }
  return section.items.filter(isServiceHomeServiceItem);
}

export function getServiceHomeErrorMessage(error: unknown): string {
  if (typeof axios.isAxiosError === 'function' && axios.isAxiosError(error)) {
    const payload = error.response?.data;
    if (payload && typeof payload === 'object' && 'message' in payload) {
      const msg = (payload as { message?: unknown }).message;
      if (typeof msg === 'string' && msg.trim()) {
        return msg;
      }
    }
    return error.message || 'Network error';
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

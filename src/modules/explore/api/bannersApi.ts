import axios from 'axios';

import { AUTH_API_BASE_URL } from '../../../config/env';

export type ExploreBanner = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  redirectType: string;
  redirectValue: string;
  buttonText?: string | null;
  priority?: number;
};

type BannersResponse = {
  success: boolean;
  banners: ExploreBanner[];
};

function getNodeApiOrigin(): string {
  return AUTH_API_BASE_URL.replace(/\/api\/v1\/?$/i, '');
}

export function getBannersUrl(): string {
  return `${getNodeApiOrigin()}/api/banners`;
}

/**
 * Banner files are served by the Node API (`/uploads/banners/...`).
 * Do not use `IMAGE_BASE_URL` — that points at CRM (rewardplanners.com) for service images.
 */
export function resolveBannerImageUri(imageUrl: string): string {
  const nodeOrigin = getNodeApiOrigin().replace(/\/+$/, '');

  if (/^https?:\/\//i.test(imageUrl)) {
    try {
      const parsed = new URL(imageUrl);
      const isLocalHost =
        parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
      const nodeIsRemote =
        !nodeOrigin.includes('localhost') && !nodeOrigin.includes('127.0.0.1');
      if (isLocalHost && parsed.pathname.includes('/uploads/') && nodeIsRemote) {
        return `${nodeOrigin}${parsed.pathname}${parsed.search}`;
      }
    } catch {
      // keep original URL
    }
    return imageUrl;
  }

  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${nodeOrigin}${path}`;
}

export async function fetchExploreBanners(): Promise<ExploreBanner[]> {
  const { data } = await axios.get<BannersResponse>(getBannersUrl(), {
    timeout: 15000,
  });

  if (!data?.success || !Array.isArray(data.banners)) {
    return [];
  }

  return data.banners.map(banner => ({
    ...banner,
    id: String(banner.id),
  }));
}

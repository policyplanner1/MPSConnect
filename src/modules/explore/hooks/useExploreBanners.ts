import { useCallback, useEffect, useState } from 'react';

import {
  fetchExploreBanners,
  type ExploreBanner,
} from '../api/bannersApi';

type UseExploreBannersResult = {
  banners: ExploreBanner[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useExploreBanners(): UseExploreBannersResult {
  const [banners, setBanners] = useState<ExploreBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchExploreBanners();
      setBanners(items);
    } catch (e) {
      setBanners([]);
      setError(e instanceof Error ? e.message : 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { banners, loading, error, refetch };
}

import { useEffect, useState } from 'react';

import { fetchServiceHome } from '../api/servicesApi';
import { getHomeServiceImageUrl, HomeServiceItem } from '../types/serviceHome.types';

export function useServiceHomePopular() {
  const [popular, setPopular] = useState<HomeServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchServiceHome();
        if (!cancelled) {
          setPopular(response.data.popular ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setPopular([]);
          setError(err instanceof Error ? err.message : 'Failed to load top picks.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { popular, loading, error };
}

export type TopPickCardItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUri: string | null;
};

export function mapPopularToTopPicks(items: HomeServiceItem[]): TopPickCardItem[] {
  return items.map(item => ({
    id: `${item.service_id}-${item.variant_id}`,
    title: item.name,
    description: item.description,
    price: item.price,
    imageUri: getHomeServiceImageUrl(item),
  }));
}

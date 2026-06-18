import { useEffect, useState } from 'react';

import { fetchRelatedServices } from '../api/servicesApi';
import type { TopPickCardItem } from './useServiceHomePopular';
import {
  getRelatedServiceImageUrl,
  RelatedServiceItem,
} from '../types/relatedService.types';

export function mapRelatedToTopPicks(items: RelatedServiceItem[]): TopPickCardItem[] {
  return items.map(item => ({
    id: `${item.service_id}-${item.variant_id}`,
    title: item.title || item.name,
    description: item.name,
    price: item.price,
    imageUri: getRelatedServiceImageUrl(item),
  }));
}

export function useRelatedServices(serviceId: number | null) {
  const [items, setItems] = useState<RelatedServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (serviceId == null) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchRelatedServices(serviceId);
        if (!cancelled) {
          setItems(response.data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setItems([]);
          setError(err instanceof Error ? err.message : 'Failed to load related services.');
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
  }, [serviceId]);

  return { items, loading, error };
}

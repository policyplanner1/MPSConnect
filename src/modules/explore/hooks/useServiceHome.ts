import { useCallback, useEffect, useState } from 'react';

import {
  fetchServiceHome,
  findServiceHomeSection,
  getServiceHomeBannerItems,
  getServiceHomeErrorMessage,
  getServiceHomeServiceItems,
} from '../api/serviceHomeApi';
import type { ServiceHomeSection, ServiceHomeSectionKey } from '../types/serviceHome.types';

export function useServiceHome() {
  const [sections, setSections] = useState<ServiceHomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchServiceHome();
      setSections(data);
    } catch (e) {
      setSections([]);
      setError(getServiceHomeErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch().catch(() => undefined);
  }, [refetch]);

  const getSection = useCallback(
    (sectionKey: ServiceHomeSectionKey) => findServiceHomeSection(sections, sectionKey),
    [sections],
  );

  const getServices = useCallback(
    (sectionKey: ServiceHomeSectionKey) => getServiceHomeServiceItems(sections, sectionKey),
    [sections],
  );

  const banners = getServiceHomeBannerItems(sections);

  return {
    sections,
    banners,
    loading,
    error,
    refetch,
    getSection,
    getServices,
  };
}

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';
import { useServiceHome } from '../hooks/useServiceHome';
import type {
  ServiceHomeBannerItem,
  ServiceHomeSectionKey,
  ServiceHomeServiceItem,
} from '../types/serviceHome.types';
import { isServiceHomeServiceItem } from '../types/serviceHome.types';
import ServiceHomeBannerCarousel from './ServiceHomeBannerCarousel';
import ServiceHomeServicesSection from './ServiceHomeServicesSection';

const DEFAULT_SERVICE_SECTION_KEYS: ServiceHomeSectionKey[] = [
  'quick_services',
  'popular_services',
  'exclusive_offers',
];

type ServiceHomePromoBlockProps = {
  sectionKeys?: ServiceHomeSectionKey[];
  showBanner?: boolean;
  onBannerPress?: (banner: ServiceHomeBannerItem) => void;
  onServicePress?: (item: ServiceHomeServiceItem) => void;
};

export default function ServiceHomePromoBlock({
  sectionKeys = DEFAULT_SERVICE_SECTION_KEYS,
  showBanner = true,
  onBannerPress,
  onServicePress,
}: ServiceHomePromoBlockProps) {
  const { sections, banners, loading, error } = useServiceHome();

  const serviceSections = useMemo(() => {
    return sectionKeys
      .map(key => sections.find(section => section.section_key === key))
      .filter((section): section is NonNullable<typeof section> => Boolean(section))
      .map(section => ({
        key: section.section_key,
        title: section.title,
        items: section.items.filter(isServiceHomeServiceItem),
      }))
      .filter(section => section.items.length > 0 || loading);
  }, [sectionKeys, sections, loading]);

  const hasContent = showBanner
    ? banners.length > 0 || serviceSections.length > 0
    : serviceSections.length > 0;

  if (!loading && !hasContent && !error) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {showBanner ? (
        <View style={styles.bannerWrap}>
          <ServiceHomeBannerCarousel
            banners={banners}
            loading={loading}
            onBannerPress={onBannerPress}
          />
        </View>
      ) : null}

      {error && !hasContent ? (
        <Text style={[styles.errorText, inter18('regular')]}>{error}</Text>
      ) : null}

      <View style={styles.sections}>
        {serviceSections.map(section => (
          <ServiceHomeServicesSection
            key={section.key}
            sectionKey={section.key}
            title={section.title}
            items={section.items}
            loading={loading}
            onServicePress={onServicePress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  bannerWrap: {
    marginTop: 8,
    marginBottom: 14,
  },
  sections: {
    gap: 14,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
});

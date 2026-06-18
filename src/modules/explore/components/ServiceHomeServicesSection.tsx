import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import ServicesSectionCard from '../../services/components/ServicesSectionCard';
import type { ServiceHomeSectionKey, ServiceHomeServiceItem } from '../types/serviceHome.types';
import ServiceHomeServiceCard, { SERVICE_HOME_CARD_WIDTH } from './ServiceHomeServiceCard';

type ServiceHomeServicesSectionProps = {
  title: string;
  sectionKey?: ServiceHomeSectionKey;
  items: ServiceHomeServiceItem[];
  loading?: boolean;
  onServicePress?: (item: ServiceHomeServiceItem) => void;
};

export default function ServiceHomeServicesSection({
  title,
  items,
  loading = false,
  onServicePress,
}: ServiceHomeServicesSectionProps) {
  if (!loading && !items.length) {
    return null;
  }

  return (
    <ServicesSectionCard title={title}>
      {loading && items.length === 0 ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#5E02AF" size="small" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.content}
          decelerationRate="fast">
          {items.map((item, index) => (
            <View
              key={`${item.service_id}-${item.variant_id}`}
              style={[styles.item, index === items.length - 1 && styles.itemLast]}>
              <ServiceHomeServiceCard item={item} onPress={onServicePress} />
            </View>
          ))}
        </ScrollView>
      )}
    </ServicesSectionCard>
  );
}

const styles = StyleSheet.create({
  loadingRow: {
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  content: {
    paddingTop: 4,
    paddingLeft: 14,
    paddingRight: 4,
  },
  item: {
    marginRight: 12,
    width: SERVICE_HOME_CARD_WIDTH,
  },
  itemLast: {
    marginRight: 14,
  },
});

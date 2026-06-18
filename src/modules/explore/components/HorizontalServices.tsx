import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { ExploreServiceItem } from '../data/exploreData';
import ServiceCard from './ServiceCard';

type HorizontalServicesProps = {
  services: ExploreServiceItem[];
  onServicePress?: (service: ExploreServiceItem) => void;
};

export default function HorizontalServices({
  services,
  onServicePress,
}: HorizontalServicesProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      decelerationRate="fast">
      {services.map((service, index) => (
        <View
          key={service.id}
          style={[styles.item, index === services.length - 1 && styles.itemLast]}>
          <ServiceCard service={service} onPress={() => onServicePress?.(service)} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  item: {
    marginRight: 12,
  },
  itemLast: {
    marginRight: 16,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';
import type { ExploreCategory, ExploreServiceItem } from '../data/exploreData';
import HorizontalServices from './HorizontalServices';
import ServiceCard from './ServiceCard';

type CategorySectionProps = {
  category: ExploreCategory;
  onServicePress?: (service: ExploreServiceItem) => void;
};

function GridServices({
  services,
  onServicePress,
}: {
  services: ExploreServiceItem[];
  onServicePress?: (service: ExploreServiceItem) => void;
}) {
  const pairs: ExploreServiceItem[][] = [];
  for (let i = 0; i < services.length; i += 2) {
    pairs.push(services.slice(i, i + 2));
  }

  return (
    <View style={styles.gridWrap}>
      {pairs.map(row => (
        <View key={row.map(s => s.id).join('-')} style={styles.gridRow}>
          {row.map(service => (
            <View key={service.id} style={styles.gridCell}>
              <ServiceCard
                compact
                service={service}
                onPress={() => onServicePress?.(service)}
              />
            </View>
          ))}
          {row.length === 1 ? <View style={styles.gridCell} /> : null}
        </View>
      ))}
    </View>
  );
}

export default function CategorySection({ category, onServicePress }: CategorySectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.titlePill}>
        <Text style={[styles.title, inter18('bold')]}>{category.title}</Text>
      </View>

      {category.layout === 'horizontal' ? (
        <HorizontalServices services={category.services} onServicePress={onServicePress} />
      ) : (
        <GridServices services={category.services} onServicePress={onServicePress} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  titlePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF08A',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    color: '#111827',
  },
  gridWrap: {
    paddingHorizontal: 16,
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCell: {
    flex: 1,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';
import type { ExploreCategory, ExploreServiceItem } from '../data/exploreData';
import HorizontalServices from './HorizontalServices';

type CategorySectionProps = {
  category: ExploreCategory;
  onServicePress?: (service: ExploreServiceItem) => void;
};

export default function CategorySection({ category, onServicePress }: CategorySectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.titlePill}>
        <Text style={[styles.title, inter18('bold')]}>{category.title}</Text>
      </View>

      <HorizontalServices services={category.services} onServicePress={onServicePress} />
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
});

import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';
import {
  getServiceHomeItemImageUrl,
  resolveServiceHomeImageUrl,
  type ServiceHomeServiceItem,
} from '../types/serviceHome.types';

type ServiceHomeQuickTileProps = {
  item: ServiceHomeServiceItem;
  onPress?: (item: ServiceHomeServiceItem) => void;
};

export default function ServiceHomeQuickTile({ item, onPress }: ServiceHomeQuickTileProps) {
  const imageUri = resolveServiceHomeImageUrl(getServiceHomeItemImageUrl(item));
  const label = item.title?.trim() || item.name;

  return (
    <Pressable
      onPress={onPress ? () => onPress(item) : undefined}
      style={({ pressed }) => [styles.item, pressed && onPress ? { opacity: 0.9 } : null]}>
      <View style={styles.iconCard}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <Text numberOfLines={2} style={[styles.label, inter18('medium')]}>
        {label}
      </Text>
    </Pressable>
  );
}

export const SERVICE_HOME_QUICK_TILE_WIDTH = 88;

const styles = StyleSheet.create({
  item: {
    width: SERVICE_HOME_QUICK_TILE_WIDTH,
    alignItems: 'center',
  },
  iconCard: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  image: {
    width: 42,
    height: 42,
  },
  placeholder: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    color: '#374151',
    textAlign: 'center',
    width: '100%',
  },
});

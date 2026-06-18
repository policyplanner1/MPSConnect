import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

type SearchBarProps = {
  placeholder?: string;
  location?: string;
  onPress?: () => void;
  onLocationPress?: () => void;
};

function SearchIcon() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Circle cx="11" cy="11" fill="none" r="7" stroke="#9CA3AF" strokeWidth="1.8" />
      <Path
        d="M20 20L16.5 16.5"
        fill="none"
        stroke="#9CA3AF"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </Svg>
  );
}

function PinIcon() {
  return (
    <Svg height={14} viewBox="0 0 24 24" width={14}>
      <Path
        d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z"
        fill="none"
        stroke="#2563EB"
        strokeWidth="1.8"
      />
      <Circle cx="12" cy="11" fill="#2563EB" r="2" />
    </Svg>
  );
}

export default function SearchBar({
  placeholder = 'Search for anything',
  location = 'Pune, Maharashtra, India',
  onPress,
  onLocationPress,
}: SearchBarProps) {
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [styles.searchBox, pressed && styles.pressed]}>
        <SearchIcon />
        <Text style={[styles.placeholder, inter18('regular')]}>{placeholder}</Text>
      </Pressable>

      <Pressable
        onPress={onLocationPress}
        disabled={!onLocationPress}
        style={styles.locationRow}
        hitSlop={6}>
        <PinIcon />
        <Text style={[styles.locationText, inter18('medium')]} numberOfLines={1}>
          {location}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: { opacity: 0.92 },
  placeholder: {
    flex: 1,
    fontSize: 15,
    color: '#9CA3AF',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  chevron: {
    fontSize: 12,
    color: '#6B7280',
  },
});

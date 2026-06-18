import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';
import type { ExploreServiceItem } from '../data/exploreData';

type ServiceCardProps = {
  service: ExploreServiceItem;
  compact?: boolean;
  onPress?: () => void;
  onWishlistPress?: () => void;
};

function HeartOutline() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Path
        d="M12 20.5s-6.5-4.2-8.8-8.1C1.5 9.2 3.4 5.5 7 5.5c2 0 3.2 1.2 5 3.2C13.8 6.7 15 5.5 17 5.5c3.6 0 5.5 3.7 3.8 6.9-2.3 3.9-8.8 8.1-8.8 8.1z"
        fill="none"
        stroke="#9CA3AF"
        strokeWidth="1.6"
      />
    </Svg>
  );
}

export default function ServiceCard({
  service,
  compact = false,
  onPress,
  onWishlistPress,
}: ServiceCardProps) {
  const cta = service.ctaLabel ?? 'Book Now';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        pressed && { opacity: 0.94 },
      ]}>
      <View style={styles.topRow}>
        {service.tag ? (
          <View style={styles.tag}>
            <Text style={[styles.tagText, inter18('bold')]}>{service.tag}</Text>
          </View>
        ) : (
          <View />
        )}
        <Pressable
          onPress={onWishlistPress}
          hitSlop={8}
          style={styles.heartBtn}
          accessibilityLabel="Add to wishlist">
          <HeartOutline />
        </Pressable>
      </View>

      <View style={[styles.iconWrap, compact && styles.iconWrapCompact]}>
        <Text style={[styles.emoji, compact && styles.emojiCompact]}>{service.emoji}</Text>
      </View>

      <Text style={[styles.title, inter18('bold')]} numberOfLines={2}>
        {service.title}
      </Text>
      <Text style={[styles.description, inter18('regular')]} numberOfLines={2}>
        {service.description}
      </Text>

      <View style={styles.ctaBtn}>
        <Text style={[styles.ctaText, inter18('semiBold')]}>{cta}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 168,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardCompact: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 22,
  },
  tag: {
    backgroundColor: '#FDE047',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 9,
    color: '#111827',
    letterSpacing: 0.2,
  },
  heartBtn: {
    padding: 2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 72,
    marginVertical: 4,
  },
  iconWrapCompact: {
    height: 64,
  },
  emoji: {
    fontSize: 44,
  },
  emojiCompact: {
    fontSize: 40,
  },
  title: {
    fontSize: 13,
    color: '#111827',
    lineHeight: 18,
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
    minHeight: 30,
    marginBottom: 10,
  },
  ctaBtn: {
    backgroundColor: '#5E02AF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
});

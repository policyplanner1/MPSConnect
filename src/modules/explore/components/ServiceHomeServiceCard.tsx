import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';
import { getServiceHomeItemImageUrl, resolveServiceHomeImageUrl } from '../types/serviceHome.types';
import type { ServiceHomeServiceItem } from '../types/serviceHome.types';

const CARD_WIDTH = 156;

type ServiceHomeServiceCardProps = {
  item: ServiceHomeServiceItem;
  onPress?: (item: ServiceHomeServiceItem) => void;
};

function formatRupee(amount: number): string {
  if (amount <= 0) {
    return '₹0';
  }
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${Math.round(amount)}`;
  }
}

function formatReviewCount(count: number): string {
  if (count >= 1_000_000) {
    return `(${(count / 1_000_000).toFixed(1)}M)`;
  }
  if (count >= 1_000) {
    return `(${(count / 1_000).toFixed(1)}K)`;
  }
  return `(${count})`;
}

function StarRating({ rating }: { rating: number }) {
  const clamped = Math.min(5, Math.max(0, rating));

  return (
    <View style={styles.starRow}>
      {Array.from({ length: 5 }, (_, index) => {
        const starIndex = index + 1;
        const filled = clamped >= starIndex;
        const half = !filled && clamped >= starIndex - 0.5;

        return (
          <Text
            key={starIndex}
            style={[
              styles.star,
              filled ? styles.starFilled : half ? styles.starHalf : styles.starEmpty,
            ]}>
            {filled ? '★' : half ? '★' : '☆'}
          </Text>
        );
      })}
    </View>
  );
}

function CoinIcon() {
  return (
    <View style={styles.coinIconWrap}>
      <Text style={styles.coinIconGlyph}>★</Text>
    </View>
  );
}

function PriceWithCoinsButton({
  price,
  coins,
  enquiry,
}: {
  price: number;
  coins: number;
  enquiry: boolean;
}) {
  if (enquiry || price <= 0) {
    return (
      <View style={styles.coinBtnInner}>
        <Text style={[styles.coinBtnText, inter18('bold')]}>Get a quote</Text>
      </View>
    );
  }

  const coinApplied = Math.min(Math.max(0, coins), price);
  const payWithCoins = Math.max(0, price - coinApplied);

  if (coinApplied > 0) {
    return (
      <View style={styles.coinBtnInner}>
        <Text style={[styles.coinBtnText, inter18('bold')]}>{formatRupee(payWithCoins)}</Text>
        <Text style={[styles.coinBtnPlus, inter18('bold')]}>+</Text>
        <CoinIcon />
        <Text style={[styles.coinBtnText, inter18('bold')]}>{coinApplied}</Text>
      </View>
    );
  }

  return (
    <View style={styles.coinBtnInner}>
      <Text style={[styles.coinBtnText, inter18('bold')]}>{formatRupee(price)}</Text>
    </View>
  );
}

export default function ServiceHomeServiceCard({ item, onPress }: ServiceHomeServiceCardProps) {
  const gradientId = `serviceHomeCoinGrad-${item.service_id}-${item.variant_id}`;
  const imageUri = resolveServiceHomeImageUrl(getServiceHomeItemImageUrl(item));
  const label = item.title?.trim() || item.name;
  const showMrp = item.mrp > 0 && item.mrp > item.price;

  return (
    <Pressable
      onPress={onPress ? () => onPress(item) : undefined}
      style={({ pressed }) => [styles.card, pressed && onPress ? { opacity: 0.96 } : null]}>
      <View style={styles.imageWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>📄</Text>
          </View>
        )}
      </View>

      <Text style={[styles.title, inter18('bold')]} numberOfLines={2}>
        {label}
      </Text>

      <View style={styles.priceRow}>
        <Text style={[styles.price, inter18('bold')]}>{formatRupee(item.price)}</Text>
        {showMrp ? (
          <Text style={[styles.mrp, inter18('regular')]}>{formatRupee(item.mrp)}</Text>
        ) : null}
      </View>

      <View style={styles.ratingRow}>
        <StarRating rating={item.rating} />
        <Text style={[styles.reviewCount, inter18('regular')]}>
          {formatReviewCount(item.total_orders)}
        </Text>
      </View>

      <View style={styles.coinBtnOuter}>
        <Svg height={40} width="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#9E8DFF" />
              <Stop offset="100%" stopColor="#5B21B6" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height={40} rx={20} fill={`url(#${gradientId})`} />
        </Svg>
        <PriceWithCoinsButton price={item.price} coins={item.coins} enquiry={item.enquiry} />
      </View>
    </Pressable>
  );
}

export const SERVICE_HOME_CARD_WIDTH = CARD_WIDTH;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    padding: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageWrap: {
    height: 108,
    borderRadius: 12,
    backgroundColor: '#F2F2F2',
    marginBottom: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 19,
    marginBottom: 6,
    minHeight: 38,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    color: '#16A34A',
  },
  mrp: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 14,
    lineHeight: 16,
    marginRight: 1,
  },
  starFilled: {
    color: '#FBBF24',
  },
  starHalf: {
    color: '#FBBF24',
    opacity: 0.55,
  },
  starEmpty: {
    color: '#D1D5DB',
  },
  reviewCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  coinBtnOuter: {
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  coinBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  coinBtnPlus: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  coinIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinIconGlyph: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 13,
  },
});

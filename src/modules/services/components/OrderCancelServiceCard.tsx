import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { IMAGE_BASE_URL } from '../../../config/env';
import { inter18 } from '../../../core/theme/typography';
import type { OrderCancelContext } from '../types/orderCancellation.types';

function resolveImageUri(imageUrl: string | null | undefined): string | null {
  if (!imageUrl?.trim()) {
    return null;
  }
  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }
  const base = (IMAGE_BASE_URL ?? '').replace(/\/+$/, '');
  const path = imageUrl.replace(/^\/+/, '');
  return base ? `${base}/${path}` : imageUrl;
}

export default function OrderCancelServiceCard({ order }: { order: OrderCancelContext }) {
  const imageUri = useMemo(() => resolveImageUri(order.imageUrl), [order.imageUrl]);
  const orderRefLabel = useMemo(() => {
    if (!order.orderRef?.trim()) {
      return null;
    }
    const ref = order.orderRef.trim();
    return ref.startsWith('#') ? ref : `#${ref}`;
  }, [order.orderRef]);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.thumb}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.thumbImage} resizeMode="cover" />
          ) : (
            <Text style={styles.thumbEmoji}>📄</Text>
          )}
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, inter18('bold')]} numberOfLines={2}>
            {order.serviceName}
          </Text>
          {order.title ? (
            <Text style={[styles.sub, inter18('regular')]} numberOfLines={2}>
              {order.title}
            </Text>
          ) : null}
          {order.variantName ? (
            <Text style={[styles.variant, inter18('regular')]} numberOfLines={1}>
              {order.variantName}
            </Text>
          ) : null}
        </View>
      </View>
      {orderRefLabel ? (
        <View style={styles.orderRefRow}>
          <Text style={[styles.orderRefLabel, inter18('regular')]}>Order ID — </Text>
          <Text style={[styles.orderRefValue, inter18('semiBold')]}>{orderRefLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 10,
  },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: { width: '100%', height: '100%' },
  thumbEmoji: { fontSize: 24 },
  textWrap: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontSize: 15, color: '#111827' },
  sub: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  variant: { fontSize: 11, color: '#9CA3AF' },
  orderRefRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  orderRefLabel: { fontSize: 12, color: '#6B7280' },
  orderRefValue: { fontSize: 12, color: '#2563EB' },
});

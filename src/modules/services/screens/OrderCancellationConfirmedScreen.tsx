import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

function CloseIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M6 6L18 18M18 6L6 18"
        stroke="#111827"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function SuccessBadge() {
  return (
    <View style={styles.badgeWrap}>
      <Svg width={72} height={72} viewBox="0 0 72 72">
        <Circle cx="36" cy="36" r="34" fill="#22C55E" />
        <Path
          d="M22 37L32 47L50 27"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

type OrderCancellationConfirmedScreenProps = {
  onClose: () => void;
  onViewCancellationDetails: () => void;
  onKeepShopping?: () => void;
  onViewAllOrders?: () => void;
};

export default function OrderCancellationConfirmedScreen({
  onClose,
  onViewCancellationDetails,
  onKeepShopping,
  onViewAllOrders,
}: OrderCancellationConfirmedScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.topRow}>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.85 }]}
          accessibilityLabel="Close">
          <CloseIcon />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={[styles.title, inter18('bold')]}>Order Cancellation{'\n'}Confirmed</Text>
          <Pressable
            onPress={onViewCancellationDetails}
            style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
            <Text style={[styles.link, inter18('semiBold')]}>View Cancellation Details ›</Text>
          </Pressable>
        </View>
        <SuccessBadge />
      </View>

      <View style={styles.menu}>
        <Pressable
          onPress={onKeepShopping ?? onClose}
          style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.9 }]}>
          <Text style={[styles.menuText, inter18('regular')]}>Keep Shopping</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <View style={styles.menuDivider} />
        <Pressable
          onPress={onViewAllOrders ?? onClose}
          style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.9 }]}>
          <Text style={[styles.menuText, inter18('regular')]}>View All Orders</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  topRow: { paddingHorizontal: 12, paddingTop: 12 },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  heroText: { flex: 1, gap: 10 },
  title: { fontSize: 22, color: '#111827', lineHeight: 28 },
  link: { fontSize: 14, color: '#5E02AF' },
  badgeWrap: {
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  menu: {
    marginTop: 28,
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  menuDivider: { height: 1, backgroundColor: '#E5E7EB' },
  menuText: { fontSize: 16, color: '#111827' },
  chevron: { fontSize: 22, color: '#9CA3AF' },
});

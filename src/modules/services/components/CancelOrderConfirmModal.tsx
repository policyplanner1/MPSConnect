import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';
import type { OrderCancelContext } from '../types/orderCancellation.types';

type CancelOrderConfirmModalProps = {
  visible: boolean;
  order: OrderCancelContext;
  onKeepOrder: () => void;
  onProceedCancel: () => void;
};

export default function CancelOrderConfirmModal({
  visible,
  order,
  onKeepOrder,
  onProceedCancel,
}: CancelOrderConfirmModalProps) {
  const coins = order.rewardCoinsSaved ?? 0;
  const hasCoins = coins > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onKeepOrder}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onKeepOrder} accessibilityLabel="Close" />
        <View style={styles.card}>
          <View style={styles.savingsBox}>
            <View style={styles.savingsLeft}>
              <Text style={styles.coinIcon}>🪙</Text>
            </View>
            <Text style={[styles.savingsText, inter18('medium')]} numberOfLines={3}>
              {hasCoins
                ? `You saved ${coins} RP coins on this product!`
                : 'You may lose rewards and savings on this product.'}
            </Text>
            <View style={styles.savingsThumb}>
              <Text style={styles.savingsThumbEmoji}>📄</Text>
            </View>
          </View>

          <Text style={[styles.message, inter18('regular')]}>
            If you cancel now, these savings will be lost and may not be available again.
          </Text>
          <Text style={[styles.question, inter18('semiBold')]}>Do you still want to cancel?</Text>

          <View style={styles.actions}>
            <Pressable
              onPress={onKeepOrder}
              style={({ pressed }) => [styles.actionBtn, styles.actionLeft, pressed && { opacity: 0.9 }]}>
              <Text style={[styles.keepText, inter18('semiBold')]}>Keep Order</Text>
            </Pressable>
            <View style={styles.actionDivider} />
            <Pressable
              onPress={onProceedCancel}
              style={({ pressed }) => [styles.actionBtn, styles.actionRight, pressed && { opacity: 0.9 }]}>
              <Text style={[styles.cancelText, inter18('bold')]}>Cancel Order</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    paddingTop: 20,
  },
  savingsBox: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 12,
    padding: 12,
  },
  savingsLeft: { width: 32, alignItems: 'center' },
  coinIcon: { fontSize: 28 },
  savingsText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 18 },
  savingsThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsThumbEmoji: { fontSize: 20 },
  message: {
    marginTop: 16,
    marginHorizontal: 20,
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
    lineHeight: 21,
  },
  question: {
    marginTop: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLeft: {},
  actionRight: {},
  actionDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  keepText: { fontSize: 15, color: '#111827' },
  cancelText: { fontSize: 15, color: '#DC2626' },
});

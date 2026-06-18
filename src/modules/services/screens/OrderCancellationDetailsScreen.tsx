import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';
import { getCrmUserId, getUserId } from '../../../core/utils/storage';
import {
  fetchCancellationDetails,
  getOrderCancellationErrorMessage,
} from '../api/orderCancellationApi';
import OrderCancelServiceCard from '../components/OrderCancelServiceCard';
import type {
  CancellationDetailsData,
  OrderCancelContext,
} from '../types/orderCancellation.types';

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M15 6L9 12L15 18"
        stroke="#111827"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function formatTimelineDate(raw: string): string {
  const iso = raw.includes(' ') ? raw.replace(' ', 'T') : raw;
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) {
    return raw;
  }
  return dt.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatMoney(amount: number): string {
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

function TimelineCheck() {
  return (
    <View style={styles.timelineIconWrap}>
      <Svg width={22} height={22} viewBox="0 0 22 22">
        <Circle cx="11" cy="11" r="11" fill="#22C55E" />
        <Path
          d="M7 11L10 14L15 8"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

function CancellationTimeline({ steps }: { steps: CancellationDetailsData['timeline'] }) {
  return (
    <View style={styles.timeline}>
      {steps.map((step, idx) => (
        <View key={`${step.event}-${idx}`} style={styles.timelineRow}>
          <View style={styles.timelineLeft}>
            <TimelineCheck />
            {idx < steps.length - 1 ? <View style={styles.timelineLine} /> : null}
          </View>
          <View style={styles.timelineBody}>
            <Text style={[styles.timelineLabel, inter18('semiBold')]}>{step.label}</Text>
            <Text style={[styles.timelineDate, inter18('regular')]}>{formatTimelineDate(step.date)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function RefundRow({
  icon,
  label,
  status,
}: {
  icon: string;
  label: string;
  status: string;
}) {
  const done = String(status).toLowerCase().includes('complete');
  return (
    <View style={styles.refundRow}>
      <Text style={styles.refundIcon}>{icon}</Text>
      <Text style={[styles.refundLabel, inter18('medium')]} numberOfLines={2}>
        {label}
      </Text>
      <View style={[styles.refundBadge, done ? styles.refundBadgeDone : styles.refundBadgePending]}>
        <Text style={[styles.refundBadgeText, inter18('semiBold')]}>
          {done ? 'Completed' : status.replace(/_/g, ' ')}
        </Text>
      </View>
    </View>
  );
}

type OrderCancellationDetailsScreenProps = {
  serviceOrderId: number;
  onBack: () => void;
};

export default function OrderCancellationDetailsScreen({
  serviceOrderId,
  onBack,
}: OrderCancellationDetailsScreenProps) {
  const [data, setData] = useState<CancellationDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const crmUserId = await getCrmUserId();
      const fallbackUserId = await getUserId();
      const userId = crmUserId ?? fallbackUserId;
      if (!userId) {
        throw new Error('Please log in again to view cancellation details.');
      }
      const res = await fetchCancellationDetails(serviceOrderId, userId);
      setData(res.data);
    } catch (e) {
      setData(null);
      setError(getOrderCancellationErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [serviceOrderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const orderCard: OrderCancelContext | null = data
    ? {
        serviceOrderId: data.service_order_id,
        serviceName: data.service.service_name,
        variantName: data.service.variant_name,
        title: data.service.title,
        orderRef: data.order_ref,
        imageUrl: data.service.image_url,
      }
    : null;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}>
          <BackIcon />
        </Pressable>
        <Text style={[styles.headerTitle, inter18('bold')]}>Order Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading && !data ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#5E02AF" />
          <Text style={[styles.centerText, inter18('regular')]}>Loading…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.errorTitle, inter18('bold')]}>Couldn’t load</Text>
          <Text style={[styles.errorText, inter18('regular')]}>{error}</Text>
          <Pressable onPress={load} style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.9 }]}>
            <Text style={[styles.retryText, inter18('semiBold')]}>Retry</Text>
          </Pressable>
        </View>
      ) : data && orderCard ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#5E02AF" />}
          showsVerticalScrollIndicator={false}>
          <OrderCancelServiceCard order={orderCard} />

          <View style={styles.cancelSection}>
            <Text style={[styles.cancelTitle, inter18('bold')]}>Order Cancelled</Text>

            {data.timeline?.length ? <CancellationTimeline steps={data.timeline} /> : null}

            <Text style={[styles.refundTotal, inter18('bold')]}>
              Total Refund — {formatMoney(data.refund.total)}
            </Text>

            {data.refund.coin_refund > 0 ? (
              <RefundRow
                icon="⚽"
                label={`${formatMoney(data.refund.coin_refund)} Reward Points`}
                status={data.cancellation.refund_status}
              />
            ) : null}

            {data.refund.money_refund > 0 ? (
              <RefundRow
                icon="🪙"
                label={`${formatMoney(data.refund.money_refund)} Money back to bank`}
                status={data.cancellation.refund_status}
              />
            ) : null}

            {data.rewards.reversed > 0 ? (
              <View style={styles.rewardsRow}>
                <Text style={[styles.rewardsLabel, inter18('regular')]}>Rewards reversed</Text>
                <Text style={[styles.rewardsValue, inter18('semiBold')]}>{data.rewards.reversed}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.summaryCard}>
            <Text style={[styles.summaryTitle, inter18('bold')]}>Price summary</Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, inter18('regular')]}>Service total</Text>
              <Text style={[styles.summaryValue, inter18('medium')]}>
                {formatMoney(data.summary.service_total)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, inter18('regular')]}>Order total</Text>
              <Text style={[styles.summaryValue, inter18('bold')]}>
                {formatMoney(data.summary.order_total)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, inter18('regular')]}>Refund method</Text>
              <Text style={[styles.summaryValue, inter18('medium')]}>
                {data.cancellation.refund_method.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#F7F7F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, color: '#111827' },
  headerSpacer: { width: 40 },
  scroll: { padding: 16, paddingBottom: 40, gap: 12 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  centerText: { fontSize: 13, color: '#6B7280' },
  errorTitle: { fontSize: 16, color: '#111827' },
  errorText: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  retryBtn: {
    marginTop: 4,
    backgroundColor: '#5E02AF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: '#FFFFFF', fontSize: 13 },
  cancelSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 14,
  },
  cancelTitle: { fontSize: 16, color: '#DC2626' },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', gap: 12 },
  timelineLeft: { alignItems: 'center', width: 24 },
  timelineIconWrap: { zIndex: 1 },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#BBF7D0',
    marginTop: -2,
    marginBottom: -2,
    minHeight: 28,
  },
  timelineBody: { flex: 1, paddingBottom: 16 },
  timelineLabel: { fontSize: 14, color: '#111827' },
  timelineDate: { marginTop: 2, fontSize: 12, color: '#6B7280' },
  refundTotal: { fontSize: 15, color: '#111827', marginTop: 4 },
  refundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
  },
  refundIcon: { fontSize: 20 },
  refundLabel: { flex: 1, fontSize: 13, color: '#111827' },
  refundBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  refundBadgeDone: { backgroundColor: '#DCFCE7' },
  refundBadgePending: { backgroundColor: '#FEF3C7' },
  refundBadgeText: { fontSize: 11, color: '#166534', textTransform: 'capitalize' },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  rewardsLabel: { fontSize: 12, color: '#6B7280' },
  rewardsValue: { fontSize: 13, color: '#111827' },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 10,
  },
  summaryTitle: { fontSize: 15, color: '#111827', marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  summaryLabel: { fontSize: 13, color: '#6B7280' },
  summaryValue: { fontSize: 13, color: '#111827' },
});

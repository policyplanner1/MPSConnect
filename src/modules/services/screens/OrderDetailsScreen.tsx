import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { FORCE_SERVICE_FEEDBACK } from '../../../config/env';
import { inter18 } from '../../../core/theme/typography';
import { getCrmEnquiryUserId } from '../../../core/utils/crmUserSession';
import { useOrderDetails } from '../hooks/useOrderDetails';
import { useOrderCancellationState } from '../hooks/useOrderCancellationState';
import { payExistingParentOrder } from '../api/servicePaymentApi';
import CancelOrderConfirmModal from '../components/CancelOrderConfirmModal';
import ServiceFeedbackForm from '../components/ServiceFeedbackForm';
import type { OrderDetailsData, OrderDetailsTimelineStep } from '../types/orderDetails.types';
import type { OrderCancelContext } from '../types/orderCancellation.types';
import OrderCancellationConfirmedScreen from './OrderCancellationConfirmedScreen';
import OrderCancellationDetailsScreen from './OrderCancellationDetailsScreen';
import RequestCancellationScreen from './RequestCancellationScreen';

type CancelFlowStep = 'request' | 'confirmed' | 'details';

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

function formatDateTime(raw: string): string {
  const iso = raw.includes(' ') ? raw.replace(' ', 'T') : raw;
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) {
    return raw;
  }
  return dt.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

function statusMeta(status: string): { label: string; bg: string; fg: string } {
  const s = String(status || '').toLowerCase();
  if (s.includes('paid') || s === 'completed' || s === 'success') {
    return { label: status, bg: '#DCFCE7', fg: '#166534' };
  }
  if (s.includes('cancel') || s.includes('fail') || s.includes('reject')) {
    return { label: status, bg: '#FEE2E2', fg: '#991B1B' };
  }
  if (s.includes('pending')) {
    return { label: status.replace(/_/g, ' '), bg: '#FEF3C7', fg: '#92400E' };
  }
  return { label: status.replace(/_/g, ' '), bg: '#E5E7EB', fg: '#374151' };
}

function Timeline({ steps }: { steps: OrderDetailsTimelineStep[] }) {
  return (
    <View style={styles.timeline}>
      {steps.map((s, idx) => (
        <View key={`${s.status}-${idx}`} style={styles.timelineRow}>
          <View style={[styles.timelineDot, s.completed ? styles.timelineDotDone : null]} />
          <View style={styles.timelineTextWrap}>
            <Text style={[styles.timelineText, inter18(s.completed ? 'semiBold' : 'regular')]}>
              {s.status}
            </Text>
          </View>
          <Text style={[styles.timelineState, inter18('medium')]}>
            {s.completed ? 'Done' : 'Pending'}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ItemCard({
  data,
  displayStatus,
}: {
  data: OrderDetailsData;
  displayStatus: string;
}) {
  const item = data.items?.[0];
  if (!item) {
    return null;
  }
  const badge = statusMeta(displayStatus || item.status || data.status);
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <Text style={[styles.cardTitle, inter18('bold')]} numberOfLines={2}>
            {item.title || item.service_name}
          </Text>
          <Text style={[styles.cardSub, inter18('regular')]} numberOfLines={2}>
            {item.service_name}
            {item.variant_name ? ` • ${item.variant_name}` : ''}
            {item.order_ref ? ` • #${item.order_ref}` : ''}
          </Text>
        </View>
        <View style={styles.cardTopRight}>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, inter18('semiBold'), { color: badge.fg }]}>
              {badge.label}
            </Text>
          </View>
          <Text style={[styles.amount, inter18('bold')]}>{formatMoney(item.price)}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.metaLabel, inter18('regular')]}>Parent Order ID</Text>
        <Text style={[styles.metaValue, inter18('medium')]} numberOfLines={1}>
          {data.parent_order_id}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.metaLabel, inter18('regular')]}>Created</Text>
        <Text style={[styles.metaValue, inter18('medium')]}>
          {formatDateTime(data.created_at)}
        </Text>
      </View>
    </View>
  );
}

function SummaryCard({
  data,
  displayStatus,
}: {
  data: OrderDetailsData;
  displayStatus: string;
}) {
  const badge = statusMeta(displayStatus || data.status);
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <Text style={[styles.cardTitle, inter18('bold')]}>Order details</Text>
          <Text style={[styles.cardSub, inter18('regular')]}>
            Created {formatDateTime(data.created_at)}
          </Text>
        </View>
        <View style={styles.cardTopRight}>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, inter18('semiBold'), { color: badge.fg }]}>
              {badge.label}
            </Text>
          </View>
          <Text style={[styles.amount, inter18('bold')]}>{formatMoney(data.total_amount)}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.metaLabel, inter18('regular')]}>Parent Order ID</Text>
        <Text style={[styles.metaValue, inter18('medium')]} numberOfLines={1}>
          {data.parent_order_id}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryPill}>
          <Text style={[styles.summaryLabel, inter18('regular')]}>Services</Text>
          <Text style={[styles.summaryValue, inter18('bold')]}>{data.summary.total_services}</Text>
        </View>
        <View style={styles.summaryPill}>
          <Text style={[styles.summaryLabel, inter18('regular')]}>Completed</Text>
          <Text style={[styles.summaryValue, inter18('bold')]}>
            {data.summary.completed_services}
          </Text>
        </View>
        <View style={styles.summaryPill}>
          <Text style={[styles.summaryLabel, inter18('regular')]}>Bundles</Text>
          <Text style={[styles.summaryValue, inter18('bold')]}>{data.summary.total_bundles}</Text>
        </View>
      </View>
    </View>
  );
}

export default function OrderDetailsScreen({
  parentOrderId,
  onBack,
  onUploadDocuments,
  onViewAllOrders,
}: {
  parentOrderId: string;
  onBack: () => void;
  onUploadDocuments?: (params: { parentOrderId: string; orderId: string }) => void;
  onViewAllOrders?: () => void;
}) {
  const { data, loading, error, refetch } = useOrderDetails(parentOrderId);
  const { displayStatus, isCancelled, rememberCancelled } = useOrderCancellationState(
    parentOrderId,
    data,
  );
  const [paying, setPaying] = useState(false);
  const [devPreviewFeedback, setDevPreviewFeedback] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelFlow, setCancelFlow] = useState<CancelFlowStep | null>(null);
  const [cancelServiceOrderId, setCancelServiceOrderId] = useState<number | null>(null);

  const firstItem = useMemo(() => data?.items?.[0] ?? null, [data?.items]);
  const canPayNow =
    !isCancelled && String(displayStatus || data?.status || '').toLowerCase().includes('pending_payment');
  const canCancel = Boolean(firstItem?.cancellation?.can_cancel) && !isCancelled;

  const cancelContext = useMemo<OrderCancelContext | null>(() => {
    if (!firstItem) {
      return null;
    }
    return {
      parentOrderId,
      serviceOrderId: firstItem.id,
      serviceName: firstItem.service_name,
      variantName: firstItem.variant_name,
      title: firstItem.title,
      orderRef: firstItem.order_ref,
      imageUrl: firstItem.image_url,
      rewardCoinsSaved: 0,
    };
  }, [firstItem, parentOrderId]);

  const orderRefLabel = useMemo(() => {
    const ref = firstItem?.order_ref;
    if (!ref) {
      return null;
    }
    return ref.startsWith('#') ? ref : `#${ref}`;
  }, [firstItem?.order_ref]);

  const feedbackMeta = firstItem?.feedback;
  const feedbackEligible =
    Boolean(feedbackMeta?.can_submit) && !Boolean(feedbackMeta?.submitted);
  const feedbackSubmitted = Boolean(feedbackMeta?.submitted);
  const showFeedbackForm =
    feedbackEligible || (__DEV__ && (FORCE_SERVICE_FEEDBACK || devPreviewFeedback));

  const exitCancelFlow = () => {
    setCancelFlow(null);
    setCancelModalVisible(false);
    setCancelServiceOrderId(null);
  };

  const handleUploadDocuments = () => {
    if (!onUploadDocuments || !orderRefLabel) {
      return;
    }
    onUploadDocuments({ parentOrderId, orderId: orderRefLabel });
  };

  const handlePayNow = async () => {
    if (!canPayNow || paying) {
      return;
    }
    setPaying(true);
    try {
      const userId = await getCrmEnquiryUserId();
      if (userId == null) {
        throw new Error(
          'CRM user id is not available. Please log in again or set CRM_ENQUIRY_USER_ID in .env.',
        );
      }
      await payExistingParentOrder({
        userId,
        parentOrderId,
        description: 'Service order payment',
      });
      await refetch();
    } catch {
      // payment errors are surfaced inside the payment flow via alerts
    } finally {
      setPaying(false);
    }
  };

  if (cancelFlow === 'request' && cancelContext) {
    return (
      <RequestCancellationScreen
        order={cancelContext}
        onBack={() => {
          setCancelFlow(null);
        }}
        onSubmitted={async serviceOrderId => {
          await rememberCancelled(serviceOrderId);
          setCancelServiceOrderId(serviceOrderId);
          setCancelFlow('confirmed');
        }}
        onAlreadyCancelled={async serviceOrderId => {
          await rememberCancelled(serviceOrderId);
          setCancelServiceOrderId(serviceOrderId);
          setCancelFlow('details');
        }}
      />
    );
  }

  if (cancelFlow === 'confirmed') {
    return (
      <OrderCancellationConfirmedScreen
        onClose={() => {
          exitCancelFlow();
          void refetch();
        }}
        onViewCancellationDetails={() => setCancelFlow('details')}
        onKeepShopping={() => {
          exitCancelFlow();
          void refetch();
        }}
        onViewAllOrders={onViewAllOrders ?? onBack}
      />
    );
  }

  if (cancelFlow === 'details' && cancelServiceOrderId != null) {
    return (
      <OrderCancellationDetailsScreen
        serviceOrderId={cancelServiceOrderId}
        onBack={() => {
          setCancelFlow(null);
          void refetch();
        }}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}>
          <BackIcon />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, inter18('bold')]} numberOfLines={1}>
            Request details
          </Text>
          <Text style={[styles.headerSub, inter18('regular')]} numberOfLines={1}>
            {parentOrderId}
          </Text>
        </View>
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
          <Pressable onPress={refetch} style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.9 }]}>
            <Text style={[styles.retryText, inter18('semiBold')]}>Retry</Text>
          </Pressable>
        </View>
      ) : data ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#5E02AF" />}>
          <ItemCard data={data} displayStatus={displayStatus} />

          {firstItem ? (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, inter18('bold')]}>Service timeline</Text>
                <Text style={[styles.sectionSub, inter18('regular')]} numberOfLines={2}>
                  {firstItem.service_name}
                  {firstItem.variant_name ? ` • ${firstItem.variant_name}` : ''}
                </Text>
                <Timeline steps={firstItem.timeline ?? []} />
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, inter18('bold')]}>Required documents</Text>
                <View style={styles.docs}>
                  {firstItem.documents?.map(doc => (
                    <View key={doc.service_document_id} style={styles.docRow}>
                      <View style={[styles.docDot, doc.uploaded ? styles.docDotDone : null]} />
                      <View style={styles.docTextWrap}>
                        <Text style={[styles.docName, inter18('semiBold')]} numberOfLines={1}>
                          {doc.document_name}
                        </Text>
                        <Text style={[styles.docMeta, inter18('regular')]} numberOfLines={1}>
                          {doc.is_mandatory ? 'Mandatory' : 'Optional'}
                          {doc.uploaded ? ' • Uploaded' : ' • Not uploaded'}
                        </Text>
                      </View>
                      <Text style={[styles.docState, inter18('medium')]}>
                        {doc.uploaded ? 'Done' : 'Pending'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {canCancel ? (
                <Pressable
                  onPress={() => setCancelModalVisible(true)}
                  style={({ pressed }) => [styles.cancelOrderBtn, pressed && { opacity: 0.9 }]}>
                  <Text style={[styles.cancelOrderBtnText, inter18('semiBold')]}>Cancel order</Text>
                </Pressable>
              ) : null}

              {isCancelled && firstItem && !canCancel ? (
                <Pressable
                  onPress={() => {
                    setCancelServiceOrderId(firstItem.id);
                    setCancelFlow('details');
                  }}
                  style={({ pressed }) => [styles.viewCancelDetailsBtn, pressed && { opacity: 0.9 }]}>
                  <Text style={[styles.viewCancelDetailsText, inter18('semiBold')]}>
                    View cancellation details
                  </Text>
                </Pressable>
              ) : null}

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={handleUploadDocuments}
                  disabled={!onUploadDocuments || !orderRefLabel}
                  style={({ pressed }) => [
                    styles.actionSecondary,
                    pressed && { opacity: 0.9 },
                    !onUploadDocuments || !orderRefLabel ? styles.actionDisabled : null,
                  ]}>
                  <Text style={[styles.actionSecondaryText, inter18('semiBold')]}>
                    Upload documents
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handlePayNow}
                  disabled={!canPayNow || paying}
                  style={({ pressed }) => [
                    styles.actionPrimary,
                    pressed && { opacity: 0.92 },
                    !canPayNow || paying ? styles.actionDisabled : null,
                  ]}>
                  <Text style={[styles.actionPrimaryText, inter18('semiBold')]}>
                    {paying ? 'Processing…' : 'Pay now'}
                  </Text>
                </Pressable>
              </View>

              {feedbackSubmitted && !showFeedbackForm ? (
                <View style={styles.feedbackBanner}>
                  <Text style={[styles.feedbackBannerTitle, inter18('semiBold')]}>
                    Thank you for your feedback
                  </Text>
                  <Text style={[styles.feedbackBannerSub, inter18('regular')]}>
                    We have received your response for this service.
                  </Text>
                </View>
              ) : null}

              {showFeedbackForm && firstItem ? (
                <View style={styles.feedbackSection}>
                  {__DEV__ && !feedbackEligible && !FORCE_SERVICE_FEEDBACK ? (
                    <Pressable
                      onPress={() => setDevPreviewFeedback(false)}
                      style={({ pressed }) => [
                        styles.devFeedbackChip,
                        pressed && { opacity: 0.9 },
                      ]}>
                      <Text style={[styles.devFeedbackChipText, inter18('medium')]}>
                        Test mode — tap to hide feedback preview
                      </Text>
                    </Pressable>
                  ) : null}
                  {__DEV__ && FORCE_SERVICE_FEEDBACK && !feedbackEligible ? (
                    <View style={styles.devFeedbackChip}>
                      <Text style={[styles.devFeedbackChipText, inter18('medium')]}>
                        Test mode — FORCE_SERVICE_FEEDBACK is on in .env
                      </Text>
                    </View>
                  ) : null}
                  <ServiceFeedbackForm
                    serviceOrderId={firstItem.id}
                    serviceName={firstItem.service_name}
                    variantName={firstItem.variant_name}
                    orderRef={firstItem.order_ref}
                    subtitle={firstItem.title}
                    onSubmitted={() => {
                      void refetch();
                    }}
                  />
                </View>
              ) : null}

              {__DEV__ &&
              !showFeedbackForm &&
              !feedbackSubmitted &&
              firstItem &&
              !FORCE_SERVICE_FEEDBACK ? (
                <Pressable
                  onPress={() => setDevPreviewFeedback(true)}
                  style={({ pressed }) => [
                    styles.devFeedbackToggle,
                    pressed && { opacity: 0.9 },
                  ]}>
                  <Text style={[styles.devFeedbackToggleText, inter18('semiBold')]}>
                    Preview feedback form (test)
                  </Text>
                </Pressable>
              ) : null}
            </>
          ) : null}
        </ScrollView>
      ) : null}

      {cancelContext ? (
        <CancelOrderConfirmModal
          visible={cancelModalVisible}
          order={cancelContext}
          onKeepOrder={() => setCancelModalVisible(false)}
          onProceedCancel={() => {
            setCancelModalVisible(false);
            setCancelFlow('request');
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#F7F7F7',
  },
  backBtn: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, minWidth: 0 },
  headerTitle: { fontSize: 18, color: '#111827' },
  headerSub: { marginTop: 2, fontSize: 11, color: '#6B7280' },
  scroll: { paddingHorizontal: 16, paddingBottom: 130, gap: 12 },
  center: {
    flex: 1,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  centerText: { fontSize: 12, color: '#6B7280' },
  errorTitle: { fontSize: 16, color: '#111827' },
  errorText: { fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 18 },
  retryBtn: {
    marginTop: 4,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: '#FFFFFF', fontSize: 13 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  cardTop: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  cardTopLeft: { flex: 1, minWidth: 0 },
  cardTopRight: { alignItems: 'flex-end', gap: 8 },
  cardTitle: { fontSize: 14, color: '#111827' },
  cardSub: { marginTop: 2, fontSize: 11, color: '#6B7280' },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 11, textTransform: 'capitalize' },
  amount: { fontSize: 14, color: '#111827' },
  metaRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  metaLabel: { fontSize: 11, color: '#6B7280' },
  metaValue: { flex: 1, fontSize: 11, color: '#111827', textAlign: 'right' },
  summaryRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  summaryPill: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  summaryLabel: { fontSize: 11, color: '#6B7280' },
  summaryValue: { fontSize: 14, color: '#111827' },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  sectionTitle: { fontSize: 13, color: '#111827', marginBottom: 10 },
  sectionSub: { marginTop: -6, marginBottom: 10, fontSize: 11, color: '#6B7280' },
  timeline: { gap: 10 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E5E7EB' },
  timelineDotDone: { backgroundColor: '#5E02AF' },
  timelineTextWrap: { flex: 1, minWidth: 0 },
  timelineText: { fontSize: 12, color: '#111827' },
  timelineState: { fontSize: 11, color: '#6B7280' },
  docs: { gap: 10 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  docDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E5E7EB' },
  docDotDone: { backgroundColor: '#22C55E' },
  docTextWrap: { flex: 1, minWidth: 0 },
  docName: { fontSize: 12, color: '#111827' },
  docMeta: { marginTop: 1, fontSize: 11, color: '#6B7280' },
  docState: { fontSize: 11, color: '#6B7280' },
  cancelOrderBtn: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelOrderBtnText: { fontSize: 14, color: '#DC2626' },
  viewCancelDetailsBtn: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    backgroundColor: '#F5F3FF',
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewCancelDetailsText: { fontSize: 13, color: '#5E02AF' },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionSecondary: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionSecondaryText: {
    fontSize: 13,
    color: '#111827',
  },
  actionPrimary: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#5E02AF',
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionPrimaryText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  actionDisabled: {
    opacity: 0.6,
  },
  feedbackSection: { gap: 8 },
  feedbackBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 14,
    gap: 4,
  },
  feedbackBannerTitle: { fontSize: 14, color: '#166534' },
  feedbackBannerSub: { fontSize: 12, color: '#15803D', lineHeight: 18 },
  devFeedbackToggle: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    backgroundColor: '#F5F3FF',
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  devFeedbackToggleText: { fontSize: 13, color: '#5E02AF' },
  devFeedbackChip: {
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  devFeedbackChipText: { fontSize: 11, color: '#92400E', textAlign: 'center' },
});


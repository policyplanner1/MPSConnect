import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';
import { getCrmUserId, getUserId } from '../../../core/utils/storage';
import {
  fetchCancellationReasons,
  getOrderCancellationErrorMessage,
  submitCancelOrderRequest,
} from '../api/orderCancellationApi';
import GradientSubmitButton from '../components/GradientSubmitButton';
import OrderCancelServiceCard from '../components/OrderCancelServiceCard';
import type {
  CancellationReason,
  OrderCancelContext,
} from '../types/orderCancellation.types';

const OTHER_REASON_ID = 8;
/** Matches Home / My requests scroll padding above `ServicesBottomTabBar`. */
const BOTTOM_TAB_CLEARANCE = 130;

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

type RequestCancellationScreenProps = {
  order: OrderCancelContext;
  onBack: () => void;
  onSubmitted: (serviceOrderId: number) => void;
};

export default function RequestCancellationScreen({
  order,
  onBack,
  onSubmitted,
}: RequestCancellationScreenProps) {
  const insets = useSafeAreaInsets();
  const [reasons, setReasons] = useState<CancellationReason[]>([]);
  const [loadingReasons, setLoadingReasons] = useState(true);
  const [reasonsError, setReasonsError] = useState<string | null>(null);
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReasons = useCallback(async () => {
    setLoadingReasons(true);
    setReasonsError(null);
    try {
      const res = await fetchCancellationReasons();
      setReasons(res.reasons);
    } catch (e) {
      setReasonsError(getOrderCancellationErrorMessage(e));
    } finally {
      setLoadingReasons(false);
    }
  }, []);

  useEffect(() => {
    void loadReasons();
  }, [loadReasons]);

  const commentRequired = selectedReasonId === OTHER_REASON_ID;

  const handleSubmit = async () => {
    if (selectedReasonId == null) {
      Alert.alert('Reason required', 'Please select a reason for cancellation.');
      return;
    }
    const commentTrim = comment.trim();
    if (commentRequired && !commentTrim) {
      Alert.alert('Comments required', 'Please tell us more about your reason for cancelling.');
      return;
    }

    setSubmitting(true);
    try {
      const crmUserId = await getCrmUserId();
      const fallbackUserId = await getUserId();
      const userId = crmUserId ?? fallbackUserId;
      if (!userId) {
        throw new Error('Please log in again to submit your cancellation request.');
      }

      await submitCancelOrderRequest({
        user_id: userId,
        service_order_id: order.serviceOrderId,
        reason_id: selectedReasonId,
        comment: commentTrim,
      });

      onSubmitted(order.serviceOrderId);
    } catch (e) {
      Alert.alert('Could not submit', getOrderCancellationErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}>
          <BackIcon />
        </Pressable>
        <Text style={[styles.headerTitle, inter18('bold')]}>Request Cancellation</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: BOTTOM_TAB_CLEARANCE + (insets.bottom || 0) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.scrollGap}>
            <OrderCancelServiceCard order={order} />
          </View>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, inter18('bold')]}>Reason for cancellation</Text>
            {loadingReasons ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#5E02AF" />
                <Text style={[styles.loadingText, inter18('regular')]}>Loading reasons…</Text>
              </View>
            ) : reasonsError ? (
              <View style={styles.errorBox}>
                <Text style={[styles.errorText, inter18('regular')]}>{reasonsError}</Text>
                <Pressable onPress={loadReasons}>
                  <Text style={[styles.retryText, inter18('semiBold')]}>Retry</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.reasonList}>
                {reasons.map(r => {
                  const selected = selectedReasonId === r.reason_id;
                  return (
                    <Pressable
                      key={r.reason_id}
                      onPress={() => setSelectedReasonId(r.reason_id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      style={({ pressed }) => [
                        styles.reasonRow,
                        pressed && { opacity: 0.9 },
                      ]}>
                      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                        {selected ? <View style={styles.radioInner} /> : null}
                      </View>
                      <Text
                        style={[
                          styles.reasonText,
                          inter18(selected ? 'semiBold' : 'regular'),
                        ]}>
                        {r.reason_text}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {selectedReasonId != null ? (
            <>
              <View style={styles.card}>
                <Text style={[styles.cardTitle, inter18('bold')]}>
                  Comments{commentRequired ? '*' : ''}
                </Text>
                <TextInput
                  multiline
                  placeholder="Enter any specific questions or requirements you'd like to share"
                  placeholderTextColor="#9CA3AF"
                  style={styles.commentInput}
                  value={comment}
                  onChangeText={setComment}
                  textAlignVertical="top"
                />
              </View>

              {!loadingReasons && !reasonsError ? (
                <View style={styles.submitSection}>
                  <GradientSubmitButton
                    title="Submit Request"
                    onPress={handleSubmit}
                    loading={submitting}
                    disabled={submitting}
                  />
                </View>
              ) : null}
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F7' },
  flex: { flex: 1 },
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
  scroll: { padding: 16 },
  scrollGap: { marginBottom: 12 },
  submitSection: {
    width: '100%',
    marginTop: 4,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, color: '#111827' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  loadingText: { fontSize: 13, color: '#6B7280' },
  errorBox: { gap: 8, paddingVertical: 4 },
  errorText: { fontSize: 13, color: '#B91C1C' },
  retryText: { fontSize: 14, color: '#5E02AF' },
  reasonList: { gap: 14 },
  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  radioOuterSelected: { borderColor: '#111827' },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111827',
  },
  reasonText: { flex: 1, fontSize: 14, color: '#111827', lineHeight: 20 },
  commentInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
});

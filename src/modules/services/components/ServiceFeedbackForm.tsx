import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';
import { getCrmUserId, getUserId } from '../../../core/utils/storage';
import {
  getServiceFeedbackErrorMessage,
  submitServiceFeedback,
} from '../api/serviceFeedbackApi';
import type {
  ServiceFeedbackCompletionTime,
  ServiceFeedbackConfidence,
  ServiceFeedbackReuseIntent,
} from '../types/serviceFeedback.types';

const PURPLE = '#5E02AF';
const PURPLE_LIGHT = '#9E8DFF';
const TRACK_INACTIVE = '#E9D5FF';
const SLIDER_THUMB = 22;
const SLIDER_TRACK_H = 6;
const SLIDER_ROW_H = 40;

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** Discrete 1..5 from horizontal drag ratio 0..1 */
function ratioToStep(ratio: number): number {
  return clamp(Math.round(ratio * 4) + 1, 1, 5);
}

function stepToRatio(step: number): number {
  return clamp((step - 1) / 4, 0, 1);
}

type ScaleOption = { value: number; emoji: string; label: string };

const EASE_SCALE: ScaleOption[] = [
  { value: 1, emoji: '😣', label: 'Very difficult' },
  { value: 2, emoji: '😕', label: 'Difficult' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Easy' },
  { value: 5, emoji: '😄', label: 'Very easy' },
];

const EXPERT_SCALE: ScaleOption[] = [
  { value: 1, emoji: '😣', label: 'Very poor' },
  { value: 2, emoji: '😕', label: 'Poor' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Excellent' },
];

const STAR_LABELS = ['Very poor', 'Poor', 'Average', 'Good', 'Excellent'];

const COMPLETION_OPTIONS: { value: ServiceFeedbackCompletionTime; label: string }[] = [
  { value: 'faster than expected', label: 'Faster than expected' },
  { value: 'on time', label: 'On time' },
  { value: 'delayed', label: 'Delayed' },
];

const CONFIDENCE_OPTIONS: { value: ServiceFeedbackConfidence; label: string }[] = [
  { value: 'yes, completely', label: 'Yes, completely' },
  { value: 'mostly', label: 'Mostly' },
  { value: 'not really', label: 'Not really' },
];

const REUSE_OPTIONS: { value: ServiceFeedbackReuseIntent; label: string }[] = [
  { value: 'definitely', label: 'Definitely' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'unlikely', label: 'Unlikely' },
];

function FeedbackCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={[styles.question, inter18('semiBold')]}>{children}</Text>;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <View style={styles.starBlock}>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map(n => (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            accessibilityRole="button"
            accessibilityLabel={`${n} star${n === 1 ? '' : 's'}`}
            style={({ pressed }) => [styles.starBtn, pressed && { opacity: 0.85 }]}>
            <Text style={[styles.starGlyph, n <= value ? styles.starActive : styles.starIdle]}>
              ★
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.starLabelsRow}>
        {STAR_LABELS.map(label => (
          <Text key={label} style={[styles.starLabel, inter18('regular')]} numberOfLines={1}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

function EmojiDragSlider({
  options,
  value,
  onChange,
}: {
  options: ScaleOption[];
  value: number;
  onChange: (n: number) => void;
}) {
  const [trackW, setTrackW] = useState(0);
  const trackWRef = useRef(1);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const pct = stepToRatio(value);
  const fillW = trackW > 0 ? pct * trackW : 0;
  const thumbLeft =
    trackW > 0 ? clamp(pct * trackW - SLIDER_THUMB / 2, 0, trackW - SLIDER_THUMB) : 0;
  const thumbTop = (SLIDER_ROW_H - SLIDER_THUMB) / 2;

  const applyRatio = (ratio: number) => {
    onChangeRef.current(ratioToStep(ratio));
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: evt => {
          const w = trackWRef.current || 1;
          applyRatio(clamp(evt.nativeEvent.locationX / w, 0, 1));
        },
        onPanResponderMove: evt => {
          const w = trackWRef.current || 1;
          applyRatio(clamp(evt.nativeEvent.locationX / w, 0, 1));
        },
      }),
    [],
  );

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    trackWRef.current = w;
    setTrackW(w);
  };

  return (
    <View
      style={styles.scaleBlock}
      collapsable={false}
      onLayout={onTrackLayout}
      {...panResponder.panHandlers}
      accessibilityRole="adjustable"
      accessibilityValue={{ text: `${value} of 5` }}>
      <View style={styles.scaleEmojiRow} pointerEvents="none">
        {options.map(opt => {
          const active = value === opt.value;
          return (
            <View key={opt.value} style={styles.scaleEmojiCol}>
              <Text style={[styles.scaleEmoji, !active && styles.scaleEmojiMuted]}>
                {opt.emoji}
              </Text>
              <Text
                style={[
                  styles.scaleLabelUnderEmoji,
                  inter18(active ? 'semiBold' : 'regular'),
                  active && styles.scaleLabelActive,
                ]}
                numberOfLines={2}>
                {opt.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.sliderTrackRow} pointerEvents="none">
        <View style={styles.sliderTrackBar}>
          <View style={[styles.sliderTrackFill, { width: fillW }]} />
        </View>
        <View style={[styles.sliderThumb, { left: thumbLeft, top: thumbTop }]} />
      </View>
    </View>
  );
}

function RadioGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.radioGroup}>
      {options.map(opt => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.radioRow,
              pressed && { opacity: 0.9 },
            ]}>
            <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
              {selected ? <View style={styles.radioInner} /> : null}
            </View>
            <Text style={[styles.radioLabel, inter18(selected ? 'semiBold' : 'regular')]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SubmitGradientButton({
  title,
  onPress,
  disabled,
  loading,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.submitBtnOuter,
        (disabled || loading) && styles.submitBtnDisabled,
        pressed && !disabled && !loading ? { opacity: 0.92 } : null,
      ]}>
      <Svg height={52} width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="feedbackSubmitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={PURPLE_LIGHT} />
            <Stop offset="100%" stopColor={PURPLE} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height={52} rx={12} fill="url(#feedbackSubmitGrad)" />
      </Svg>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={[styles.submitBtnText, inter18('bold')]}>{title}</Text>
      )}
    </Pressable>
  );
}

export type ServiceFeedbackFormProps = {
  serviceOrderId: number;
  serviceName: string;
  variantName?: string | null;
  orderRef?: string | null;
  subtitle?: string | null;
  onSubmitted?: () => void;
};

export default function ServiceFeedbackForm({
  serviceOrderId,
  serviceName,
  variantName,
  orderRef,
  subtitle,
  onSubmitted,
}: ServiceFeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [easeRating, setEaseRating] = useState(1);
  const [expertRating, setExpertRating] = useState(1);
  const [completionTime, setCompletionTime] = useState<ServiceFeedbackCompletionTime | null>(
    null,
  );
  const [confidence, setConfidence] = useState<ServiceFeedbackConfidence | null>(null);
  const [reuseIntent, setReuseIntent] = useState<ServiceFeedbackReuseIntent | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const orderRefLabel = useMemo(() => {
    if (!orderRef) {
      return null;
    }
    const trimmed = orderRef.trim();
    if (!trimmed) {
      return null;
    }
    return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  }, [orderRef]);

  const handleSubmit = async () => {
    if (rating < 1) {
      Alert.alert('Rating required', 'Please rate your overall experience.');
      return;
    }
    if (!completionTime) {
      Alert.alert('Required', 'Please tell us if your service was completed on time.');
      return;
    }
    if (!confidence) {
      Alert.alert('Required', 'Please tell us how confident you felt about the service.');
      return;
    }
    if (!reuseIntent) {
      Alert.alert('Required', 'Please tell us if you would use this service again.');
      return;
    }

    setSubmitting(true);
    try {
      const crmUserId = await getCrmUserId();
      const fallbackUserId = await getUserId();
      const userId = crmUserId ?? fallbackUserId;
      if (!userId) {
        throw new Error('Please log in again to submit feedback.');
      }

      await submitServiceFeedback({
        user_id: userId,
        service_order_id: serviceOrderId,
        rating,
        ease_rating: easeRating,
        expert_rating: expertRating,
        completion_time: completionTime,
        confidence,
        reuse_intent: reuseIntent,
        comment: comment.trim(),
      });

      Alert.alert('Thank you!', 'Your feedback has been submitted.');
      onSubmitted?.();
    } catch (e) {
      Alert.alert('Could not submit', getServiceFeedbackErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <View style={styles.wrap}>
        <View style={styles.heroCard}>
          <Text style={[styles.heroTitle, inter18('bold')]} numberOfLines={2}>
            {serviceName}
          </Text>
          {variantName ? (
            <Text style={[styles.heroSub, inter18('regular')]} numberOfLines={1}>
              {variantName}
            </Text>
          ) : null}
          {subtitle ? (
            <Text style={[styles.heroDesc, inter18('regular')]} numberOfLines={3}>
              {subtitle}
            </Text>
          ) : null}
          {orderRefLabel ? (
            <View style={styles.orderRefRow}>
              <Text style={[styles.orderRefLabel, inter18('regular')]}>Order ID</Text>
              <Text style={[styles.orderRefValue, inter18('semiBold')]}>{orderRefLabel}</Text>
            </View>
          ) : null}
        </View>

        <FeedbackCard>
          <SectionTitle>How was your experience with this service?</SectionTitle>
          <StarRating value={rating} onChange={setRating} />
        </FeedbackCard>

        <FeedbackCard>
          <SectionTitle>How easy was it to complete this service on our app?</SectionTitle>
          <EmojiDragSlider options={EASE_SCALE} value={easeRating} onChange={setEaseRating} />
        </FeedbackCard>

        <FeedbackCard>
          <SectionTitle>How was your experience with our Service Expert?</SectionTitle>
          <EmojiDragSlider options={EXPERT_SCALE} value={expertRating} onChange={setExpertRating} />
        </FeedbackCard>

        <FeedbackCard>
          <SectionTitle>Was your service completed within the expected time?</SectionTitle>
          <RadioGroup
            options={COMPLETION_OPTIONS}
            value={completionTime}
            onChange={setCompletionTime}
          />
        </FeedbackCard>

        <FeedbackCard>
          <SectionTitle>
            Did you feel confident that your service was handled correctly?
          </SectionTitle>
          <RadioGroup options={CONFIDENCE_OPTIONS} value={confidence} onChange={setConfidence} />
        </FeedbackCard>

        <FeedbackCard>
          <SectionTitle>Would you use this service again?</SectionTitle>
          <RadioGroup options={REUSE_OPTIONS} value={reuseIntent} onChange={setReuseIntent} />
        </FeedbackCard>

        <FeedbackCard>
          <SectionTitle>Anything you&apos;d like us to improve?</SectionTitle>
          <TextInput
            multiline
            placeholder="Type here (optional)"
            placeholderTextColor="#9CA3AF"
            style={[styles.commentInput, inter18('regular')]}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </FeedbackCard>

        <SubmitGradientButton
          title="Submit"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 4,
  },
  heroTitle: { fontSize: 16, color: '#111827' },
  heroSub: { fontSize: 12, color: '#6B7280' },
  heroDesc: { marginTop: 4, fontSize: 12, color: '#6B7280', lineHeight: 18 },
  orderRefRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  orderRefLabel: { fontSize: 12, color: '#6B7280' },
  orderRefValue: { fontSize: 13, color: PURPLE },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 12,
  },
  question: { fontSize: 14, color: '#111827', lineHeight: 20 },
  starBlock: { gap: 8 },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  starBtn: { padding: 4 },
  starGlyph: { fontSize: 32 },
  starActive: { color: '#F59E0B' },
  starIdle: { color: '#D1D5DB' },
  starLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  starLabel: {
    flex: 1,
    fontSize: 9,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  scaleBlock: { gap: 14, paddingBottom: 4 },
  scaleEmojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scaleEmojiCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  scaleEmoji: { fontSize: 28, lineHeight: 34 },
  scaleEmojiMuted: { opacity: 0.28 },
  scaleLabelUnderEmoji: {
    fontSize: 9,
    color: '#9CA3AF',
    textAlign: 'center',
    minHeight: 26,
  },
  scaleLabelActive: { color: PURPLE },
  sliderTrackRow: {
    width: '100%',
    height: SLIDER_ROW_H,
    justifyContent: 'center',
    position: 'relative',
    marginTop: 2,
    overflow: 'visible',
  },
  sliderTrackBar: {
    height: SLIDER_TRACK_H,
    borderRadius: SLIDER_TRACK_H / 2,
    backgroundColor: TRACK_INACTIVE,
    overflow: 'hidden',
  },
  sliderTrackFill: {
    height: SLIDER_TRACK_H,
    borderRadius: SLIDER_TRACK_H / 2,
    backgroundColor: PURPLE_LIGHT,
  },
  sliderThumb: {
    position: 'absolute',
    width: SLIDER_THUMB,
    height: SLIDER_THUMB,
    borderRadius: SLIDER_THUMB / 2,
    backgroundColor: PURPLE,
    shadowColor: '#5E02AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  radioGroup: { gap: 10 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: PURPLE },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PURPLE,
  },
  radioLabel: { flex: 1, fontSize: 14, color: '#111827' },
  commentInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  submitBtnOuter: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16 },
});

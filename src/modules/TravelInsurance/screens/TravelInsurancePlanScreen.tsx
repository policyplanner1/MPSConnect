import React from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { TravelInsurancePlanSummary } from '../types/travelInsurance.types';
import { formatCurrencyLimit } from '../utils/travelInsuranceHelpers';
import { inter18 } from '../../../core/theme/typography';

type Props = {
  summary: TravelInsurancePlanSummary;
  onBack: () => void;
};

function BackIcon() {
  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Path
        d="M15 18L9 12L15 6"
        fill="none"
        stroke="#111111"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </Svg>
  );
}

function TravelInsurancePlanScreen({ summary, onBack }: Props) {
  const handlePay = async () => {
    if (!summary.paymentUrl) {
      Alert.alert('Payment unavailable', 'Payment link is not available right now.');
      return;
    }

    const canOpen = await Linking.canOpenURL(summary.paymentUrl);
    if (!canOpen) {
      Alert.alert('Payment unavailable', 'Unable to open the payment page.');
      return;
    }

    await Linking.openURL(summary.paymentUrl);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={onBack} style={styles.headerIconBtn}>
          <BackIcon />
        </Pressable>
        <Text style={[styles.headerTitle, inter18('bold')]}>Travel Insurance</Text>
        <View style={styles.headerIconBtn} />
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.premiumCard}>
          <Text style={[styles.premiumLabel, inter18('medium')]}>Final Premium</Text>
          <Text style={[styles.premiumValue, inter18('bold')]}>
            ₹{Number(summary.finalPremium || 0).toLocaleString('en-IN')}
          </Text>
          <Text style={[styles.planName, inter18('semiBold')]}>{summary.planName}</Text>
          <Text style={[styles.planArea, inter18('regular')]}>{summary.areaName}</Text>
          <Text style={[styles.planDates, inter18('regular')]}>
            {summary.fromDate} to {summary.toDate}
          </Text>
        </View>

        <View style={styles.coversCard}>
          <Text style={[styles.coversTitle, inter18('bold')]}>Plan Coverage</Text>
          {summary.covers.map(cover => (
            <View key={cover.pbenefits} style={styles.coverRow}>
              <Text style={[styles.coverName, inter18('regular')]}>{cover.pbenefits}</Text>
              <Text style={[styles.coverLimit, inter18('semiBold')]}>
                {formatCurrencyLimit(cover.plimits)}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={handlePay}
          style={({ pressed }) => [styles.payBtn, pressed && styles.payBtnPressed]}>
          <Svg height="100%" style={StyleSheet.absoluteFill} width="100%">
            <Defs>
              <LinearGradient id="payBtnGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                <Stop offset="0%" stopColor="#2563EB" />
                <Stop offset="100%" stopColor="#1D4ED8" />
              </LinearGradient>
            </Defs>
            <Rect
              fill="url(#payBtnGradient)"
              height="100%"
              rx="12"
              ry="12"
              width="100%"
              x="0"
              y="0"
            />
          </Svg>
          <Text style={[styles.payBtnText, inter18('bold')]}>Proceed to Pay</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    color: '#111111',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 14,
  },
  premiumCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  premiumLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  premiumValue: {
    fontSize: 34,
    color: '#111827',
    marginBottom: 10,
  },
  planName: {
    fontSize: 16,
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 4,
  },
  planArea: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },
  planDates: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
  },
  coversCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  coversTitle: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  coverRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  coverName: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  coverLimit: {
    fontSize: 13,
    color: '#111827',
  },
  payBtn: {
    minHeight: 52,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  payBtnPressed: {
    opacity: 0.92,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default TravelInsurancePlanScreen;

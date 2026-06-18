import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import CalculatorHeader from '../../components/CalculatorHeader';
import SavingsCapacityGauge from '../../components/SavingsCapacityGauge';
import type { FinancialSnapshot } from '../../types/financialPlanner';
import { formatInr } from '../../utils/formatter';
import { inter18 } from '../../../../core/theme/typography';

type FinancialSnapshotScreenProps = {
  snapshot: FinancialSnapshot;
  onEditIncome: () => void;
  onEditExpenses: () => void;
  onEditLoans: () => void;
  /** Renders inside planner hub (no header / footer). */
  embedded?: boolean;
  onBack?: () => void;
};

function MetricIcon({
  bg,
  children,
}: {
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.metricIcon, { backgroundColor: bg }]}>
      {children}
    </View>
  );
}

function WalletIcon() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Path
        d="M4 8h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth={1}
      />
    </Svg>
  );
}

function TrendIcon() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Path
        d="M4 16l4-6 4 3 8-10"
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

function BankIcon() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Path d="M4 10h16v8H4zM6 10V6h12v4M12 6V4" fill="none" stroke="#FFFFFF" strokeWidth={2} />
    </Svg>
  );
}

function InfoIcon() {
  return (
    <Svg height={14} viewBox="0 0 24 24" width={14}>
      <Circle cx={12} cy={12} fill="#2563EB" r={10} />
      <Path d="M12 10v6M12 8h.01" stroke="#FFFFFF" strokeLinecap="round" strokeWidth={2} />
    </Svg>
  );
}

function FinancialSnapshotScreen({
  snapshot,
  onBack,
  onEditIncome,
  onEditExpenses,
  onEditLoans,
  embedded = false,
}: FinancialSnapshotScreenProps) {
  const surplusPositive = snapshot.monthlySurplus >= 0;

  const body = (
      <ScrollView
        bounces={false}
        contentContainerStyle={[styles.scroll, embedded && styles.scrollEmbedded]}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, inter18('bold')]}>Financial Snapshot</Text>
        <Text style={[styles.sub, inter18('regular')]}>
          Here is the customer's financial overview.
        </Text>

        <Pressable onPress={onEditIncome} style={styles.metricCard}>
          <MetricIcon bg="#16A34A">
            <WalletIcon />
          </MetricIcon>
          <View style={styles.metricBody}>
            <Text style={[styles.metricLabel, inter18('regular')]}>Total Monthly Income</Text>
            <Text style={[styles.metricValueGreen, inter18('bold')]}>
              ₹ {formatInr(snapshot.totalIncome)}
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={onEditExpenses} style={styles.metricCard}>
          <MetricIcon bg="#DC2626">
            <TrendIcon />
          </MetricIcon>
          <View style={styles.metricBody}>
            <Text style={[styles.metricLabel, inter18('regular')]}>Total Monthly Expense</Text>
            <Text style={[styles.metricValueRed, inter18('bold')]}>
              ₹ {formatInr(snapshot.totalMonthlyExpense)}
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={onEditLoans} style={styles.metricCard}>
          <MetricIcon bg="#EA580C">
            <BankIcon />
          </MetricIcon>
          <View style={styles.metricBody}>
            <Text style={[styles.metricLabel, inter18('regular')]}>Total EMI</Text>
            <Text style={[styles.metricValueOrange, inter18('bold')]}>
              ₹ {formatInr(snapshot.totalEmi)}
            </Text>
          </View>
        </Pressable>

        <View
          style={[
            styles.surplusBox,
            !surplusPositive && styles.surplusBoxNegative,
          ]}>
          <Text
            style={[
              styles.surplusLabel,
              inter18('semiBold'),
              !surplusPositive && styles.surplusLabelNeg,
            ]}>
            Monthly Surplus
          </Text>
          <Text
            style={[
              styles.surplusValue,
              inter18('bold'),
              !surplusPositive && styles.surplusValueNeg,
            ]}>
            ₹ {formatInr(snapshot.monthlySurplus)}
          </Text>
        </View>

        <View style={styles.capacityBlock}>
          <Text style={[styles.capacityTitle, inter18('medium')]}>Savings Capacity</Text>
          <Text style={[styles.capacityPct, inter18('bold')]}>
            {snapshot.savingsCapacityPct}%
          </Text>
          <SavingsCapacityGauge percent={snapshot.savingsCapacityPct} />
        </View>

        <View style={styles.formulaRow}>
          <InfoIcon />
          <Text style={[styles.formulaText, inter18('regular')]}>
            Savings Capacity = Monthly Surplus / Total Income
          </Text>
        </View>
      </ScrollView>
  );

  if (embedded) {
    return <View style={styles.embeddedWrap}>{body}</View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="PlanWealth" />
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  embeddedWrap: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { padding: 16, paddingBottom: 24, gap: 12 },
  scrollEmbedded: { paddingBottom: 16 },
  heading: { fontSize: 22, color: '#111111' },
  sub: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 4 },
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 14,
  },
  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricBody: { flex: 1, gap: 4 },
  metricLabel: { fontSize: 13, color: '#374151' },
  metricValueGreen: { fontSize: 18, color: '#16A34A' },
  metricValueRed: { fontSize: 18, color: '#DC2626' },
  metricValueOrange: { fontSize: 18, color: '#EA580C' },
  surplusBox: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  surplusBoxNegative: { backgroundColor: '#FEE2E2' },
  surplusLabel: { fontSize: 16, color: '#15803D' },
  surplusLabelNeg: { color: '#B91C1C' },
  surplusValue: { fontSize: 32, color: '#14532D' },
  surplusValueNeg: { color: '#991B1B' },
  capacityBlock: {
    alignItems: 'center',
    marginTop: 16,
    gap: 2,
  },
  capacityTitle: {
    fontSize: 16,
    color: '#111111',
    textAlign: 'center',
  },
  capacityPct: {
    fontSize: 28,
    color: '#16A34A',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 2,
  },
  formulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  formulaText: { flex: 1, fontSize: 11, color: '#9CA3AF' },
});

export default FinancialSnapshotScreen;

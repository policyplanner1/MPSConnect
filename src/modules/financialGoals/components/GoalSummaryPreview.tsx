import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatInr } from '../../calculators/utils/formatter';
import { inter18 } from '../../../core/theme/typography';
import type { FinancialGoalResults } from '../services/goalCalculator';

type GoalSummaryPreviewProps = {
  results: FinancialGoalResults;
};

type RowProps = { label: string; value: string; highlight?: boolean };

function SummaryRow({ label, value, highlight }: RowProps) {
  return (
    <View style={[styles.row, highlight && styles.rowHighlight]}>
      <Text style={[styles.label, inter18('regular')]}>{label}</Text>
      <Text style={[styles.value, inter18(highlight ? 'bold' : 'semiBold')]}>{value}</Text>
    </View>
  );
}

export default function GoalSummaryPreview({ results }: GoalSummaryPreviewProps) {
  const yearsLabel =
    results.yearsToGoal === 1 ? '1 Year' : `${Math.round(results.yearsToGoal)} Years`;

  return (
    <View style={styles.card}>
      <SummaryRow
        label="Your Goal Amount After Inflation"
        value={`₹${formatInr(results.futureGoalValue)}`}
      />
      <View style={styles.divider} />
      <SummaryRow
        label="You Already Have"
        value={`₹${formatInr(results.amountAlreadyHave)}`}
      />
      <View style={styles.divider} />
      <SummaryRow
        label="Amount Still Required"
        value={`₹${formatInr(results.amountStillRequired)}`}
        highlight
      />
      <View style={styles.divider} />
      <SummaryRow label="Time Available" value={yearsLabel} />
      <View style={styles.divider} />
      <SummaryRow
        label="Recommended Monthly SIP"
        value={`₹${formatInr(Math.ceil(results.requiredMonthlySip))}`}
        highlight
      />
      <View style={styles.divider} />
      <SummaryRow
        label="Recommended Lumpsum Investment"
        value={`₹${formatInr(Math.round(results.requiredLumpsum))}`}
        highlight
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 4,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowHighlight: {
    backgroundColor: '#F5F3FF',
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  value: {
    fontSize: 15,
    color: '#111827',
    textAlign: 'right',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
});

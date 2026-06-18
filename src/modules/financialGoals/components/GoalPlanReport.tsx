import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatInr } from '../../calculators/utils/formatter';
import { inter18 } from '../../../core/theme/typography';
import type { FinancialGoalResults } from '../services/goalCalculator';

type GoalPlanReportProps = {
  results: FinancialGoalResults;
};

type ReportRowProps = {
  label: string;
  value: string;
  variant?: 'default' | 'gap' | 'highlight' | 'action';
  showDivider?: boolean;
};

function ReportRow({ label, value, variant = 'default', showDivider = true }: ReportRowProps) {
  const isAction = variant === 'action';
  const isHighlight = variant === 'highlight';
  const isGap = variant === 'gap';

  return (
    <>
      {showDivider && variant === 'default' ? <View style={styles.divider} /> : null}
      {isGap ? <View style={styles.sectionGap} /> : null}
      <View
        style={[
          styles.row,
          isHighlight && styles.rowHighlight,
          isAction && styles.rowAction,
        ]}>
        <Text
          style={[
            styles.rowLabel,
            inter18(isAction ? 'semiBold' : 'regular'),
            isHighlight && styles.rowLabelHighlight,
            isAction && styles.rowLabelAction,
          ]}
          numberOfLines={2}>
          {label}
        </Text>
        <Text
          style={[
            styles.rowValue,
            inter18(isAction || isHighlight ? 'bold' : 'semiBold'),
            isHighlight && styles.rowValueHighlight,
            isAction && styles.rowValueAction,
          ]}>
          {value}
        </Text>
      </View>
    </>
  );
}

export default function GoalPlanReport({ results }: GoalPlanReportProps) {
  const yearsLabel =
    results.yearsToGoal === 1 ? '1 Year' : `${Math.round(results.yearsToGoal)} Years`;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>📋</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, inter18('bold')]}>Your goal plan</Text>
          <Text style={[styles.headerSub, inter18('regular')]}>
            Personalized report based on your inputs
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <ReportRow
          label="Your Goal Amount After Inflation"
          value={`₹${formatInr(results.futureGoalValue)}`}
          showDivider={false}
        />
        <ReportRow
          label="You Already Have"
          value={`₹${formatInr(results.amountAlreadyHave)}`}
        />
        <ReportRow
          label="Amount Still Required"
          value={`₹${formatInr(results.amountStillRequired)}`}
          variant="highlight"
        />
        <ReportRow label="Time Available" value={yearsLabel} variant="gap" />
        <ReportRow
          label="Recommended Monthly SIP"
          value={`₹${formatInr(Math.ceil(results.requiredMonthlySip))}`}
          variant="action"
          showDivider={false}
        />
        <ReportRow
          label="Recommended Lumpsum Investment"
          value={`₹${formatInr(Math.round(results.requiredLumpsum))}`}
          variant="action"
        />
      </View>

      {results.amountStillRequired <= 0 ? (
        <View style={styles.congrats}>
          <Text style={[styles.congratsText, inter18('semiBold')]}>
            🎉 You are already on track for this goal amount!
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#5E02AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#5E02AF',
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: {
    fontSize: 22,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 17,
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
  },
  body: {
    paddingVertical: 4,
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
    backgroundColor: '#FFF7ED',
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 12,
  },
  rowAction: {
    backgroundColor: '#F5F3FF',
    marginHorizontal: 8,
    marginTop: 4,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  rowLabel: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  rowLabelHighlight: {
    color: '#9A3412',
    fontSize: 14,
  },
  rowLabelAction: {
    color: '#5E02AF',
    fontSize: 14,
  },
  rowValue: {
    fontSize: 15,
    color: '#111827',
    textAlign: 'right',
  },
  rowValueHighlight: {
    fontSize: 18,
    color: '#C2410C',
  },
  rowValueAction: {
    fontSize: 20,
    color: '#5E02AF',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  sectionGap: {
    height: 8,
    backgroundColor: '#F9FAFB',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    marginVertical: 4,
  },
  congrats: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  congratsText: {
    fontSize: 13,
    color: '#047857',
    textAlign: 'center',
    lineHeight: 18,
  },
});

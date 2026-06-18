import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalculatorHeader from '../components/CalculatorHeader';
import type { SavingsGoal } from '../types/savings';
import { aggregateMonth, monthLabel } from '../utils/savingsEngine';
import type { SavingsEntry } from '../types/savings';
import { formatInr } from '../utils/formatter';
import { inter18 } from '../../../core/theme/typography';

const GREEN = '#0F6E56';

type SavingsGoalsScreenProps = {
  entries: SavingsEntry[];
  goal: SavingsGoal;
  viewMonth: number;
  viewYear: number;
  onBack: () => void;
  onGoalSaved: (g: SavingsGoal) => void;
};

function SavingsGoalsScreen({
  entries,
  goal,
  viewMonth,
  viewYear,
  onBack,
  onGoalSaved,
}: SavingsGoalsScreenProps) {
  const [rateStr, setRateStr] = useState(String(goal.targetRatePct));
  const [amtStr, setAmtStr] = useState(
    goal.targetAmountMonthly != null ? String(Math.round(goal.targetAmountMonthly)) : '',
  );

  const current = useMemo(
    () => aggregateMonth(entries, viewMonth, viewYear),
    [entries, viewMonth, viewYear],
  );

  const targetRate = parseFloat(rateStr.replace(/[^0-9.]/g, '')) || 0;
  const targetAmt = parseFloat(amtStr.replace(/[^0-9]/g, '')) || 0;

  const onTrackRate = current.savingRatePct >= targetRate && targetRate > 0;
  const monthlyTarget = goal.targetAmountMonthly;
  const onTrackAmt =
    !monthlyTarget || monthlyTarget <= 0 || current.totalSaved >= monthlyTarget;

  const handleSave = () => {
    const next: SavingsGoal = {
      targetRatePct: Math.min(99, Math.max(1, targetRate || 30)),
      targetAmountMonthly: targetAmt > 0 ? targetAmt : null,
    };
    onGoalSaved(next);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="Savings goals" />
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, inter18('regular')]}>
          Targets apply to your selected month on the dashboard ({monthLabel({ month: viewMonth, year: viewYear })}).
        </Text>

        <View style={styles.card}>
          <Text style={[styles.lbl, inter18('medium')]}>Target saving rate (%)</Text>
          <Text style={[styles.hint, inter18('regular')]}>
            Share of old spend you want to keep as savings (e.g. 30%).
          </Text>
          <TextInput
            keyboardType="decimal-pad"
            style={[styles.input, inter18('regular')]}
            value={rateStr}
            onChangeText={setRateStr}
          />
        </View>

        <View style={styles.card}>
          <Text style={[styles.lbl, inter18('medium')]}>Optional monthly savings target (₹)</Text>
          <Text style={[styles.hint, inter18('regular')]}>
            Leave empty to only use the percentage goal.
          </Text>
          <TextInput
            keyboardType="number-pad"
            placeholder="e.g. 5000"
            placeholderTextColor="#9CA3AF"
            style={[styles.input, inter18('regular')]}
            value={amtStr}
            onChangeText={t => setAmtStr(t.replace(/[^0-9]/g, ''))}
          />
        </View>

        <Pressable onPress={handleSave} style={styles.saveBtn}>
          <Text style={[styles.saveText, inter18('semiBold')]}>Save goals</Text>
        </Pressable>

        <View style={styles.statusCard}>
          <Text style={[styles.statusTitle, inter18('semiBold')]}>This month</Text>
          <Text style={[styles.statusLine, inter18('regular')]}>
            Saved: ₹ {formatInr(current.totalSaved)} · Rate: {current.savingRatePct}%
          </Text>
          <Text
            style={[
              styles.statusVerdict,
              inter18('semiBold'),
              onTrackRate && onTrackAmt ? styles.ok : styles.warn,
            ]}>
            {onTrackRate
              ? `On track for your ${targetRate || goal.targetRatePct}% rate goal.`
              : `Below your ${targetRate || goal.targetRatePct}% rate goal — add or adjust entries.`}
          </Text>
          {monthlyTarget != null && monthlyTarget > 0 ? (
            <Text style={[styles.statusLine, inter18('regular'), { marginTop: 8 }]}>
              Rupee target: ₹ {formatInr(current.totalSaved)} / ₹ {formatInr(monthlyTarget)}{' '}
              {current.totalSaved >= monthlyTarget ? '(met)' : '(not yet)'}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F7' },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },
  intro: { fontSize: 12, color: '#6B7280', lineHeight: 17, marginBottom: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    padding: 14,
    marginBottom: 12,
    gap: 6,
  },
  lbl: { fontSize: 13, color: '#3F3F46' },
  hint: { fontSize: 11, color: '#9CA3AF', lineHeight: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111111',
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveText: { color: '#FFFFFF', fontSize: 15 },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    padding: 14,
  },
  statusTitle: { fontSize: 15, color: '#111111', marginBottom: 8 },
  statusLine: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  statusVerdict: { fontSize: 14, marginTop: 10, lineHeight: 20 },
  ok: { color: GREEN },
  warn: { color: '#B45309' },
});

export default SavingsGoalsScreen;

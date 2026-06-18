import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';
import GoalInputField from '../components/GoalInputField';
import GoalWizardShell from '../components/GoalWizardShell';
import {
  EMERGENCY_BACKUP_MONTHS,
  getGoalById,
} from '../constants/goalOptions';
import type { GoalWizardFormState } from '../types/goalWizard.types';
import { formatAmountInput, isDetailsStepValid, parseNum } from '../utils/goalWizardUtils';

type FinancialGoalDetailsScreenProps = {
  form: GoalWizardFormState;
  onChange: (patch: Partial<GoalWizardFormState>) => void;
  onBack: () => void;
  onCalculate: () => void;
};

export default function FinancialGoalDetailsScreen({
  form,
  onChange,
  onBack,
  onCalculate,
}: FinancialGoalDetailsScreenProps) {
  const goal = getGoalById(form.selectedGoalId);
  const isEmergency = goal.id === 'emergency';
  const valid = isDetailsStepValid(form);

  const emergencyTarget = useMemo(() => {
    const expense = parseNum(form.monthlyExpense);
    if (expense <= 0) {
      return 0;
    }
    return expense * form.emergencyBackupMonths;
  }, [form.monthlyExpense, form.emergencyBackupMonths]);

  const targetLabel =
    goal.id === 'home'
      ? 'Current house cost (today)'
      : isEmergency
        ? 'Target emergency fund'
        : 'Target goal amount';

  return (
    <GoalWizardShell
      title="Goal details"
      stepIndex={3}
      showProgress
      onBack={onBack}
      onPrimary={onCalculate}
      primaryLabel="Calculate my plan"
      primaryDisabled={!valid}>
      <View style={styles.goalBadge}>
        <Text style={styles.goalEmoji}>{goal.emoji}</Text>
        <Text style={[styles.goalName, inter18('semiBold')]}>{goal.label}</Text>
      </View>

      <View style={styles.card}>
        {isEmergency ? (
          <>
            <Text style={[styles.blockLabel, inter18('semiBold')]}>Backup duration</Text>
            <View style={styles.chips}>
              {EMERGENCY_BACKUP_MONTHS.map(months => {
                const active = form.emergencyBackupMonths === months;
                return (
                  <Pressable
                    key={months}
                    onPress={() => {
                      const expense = parseNum(form.monthlyExpense);
                      onChange({
                        emergencyBackupMonths: months,
                        targetAmount:
                          expense > 0 ? formatAmountInput(expense * months) : form.targetAmount,
                      });
                    }}
                    style={[styles.chip, active && styles.chipActive]}>
                    <Text
                      style={[
                        styles.chipText,
                        inter18(active ? 'semiBold' : 'regular'),
                        active && styles.chipTextActive,
                      ]}>
                      {months} mo
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {emergencyTarget > 0 ? (
              <Text style={[styles.hint, inter18('regular')]}>
                Based on monthly expense × {form.emergencyBackupMonths} months = ₹
                {formatAmountInput(emergencyTarget)}
              </Text>
            ) : (
              <Text style={[styles.hint, inter18('regular')]}>
                Enter monthly expense on the previous screen to auto-calculate target.
              </Text>
            )}
          </>
        ) : null}

        <GoalInputField
          label={targetLabel}
          hint={goal.description}
          prefix="₹"
          value={form.targetAmount}
          onChangeText={text => onChange({ targetAmount: text })}
          editable={!isEmergency || parseNum(form.monthlyExpense) <= 0}
          keyboardType="number-pad"
        />
        <GoalInputField
          label="Goal time period"
          suffix="yrs"
          value={form.yearsToGoal}
          onChangeText={text => onChange({ yearsToGoal: text })}
          keyboardType="number-pad"
        />
        <GoalInputField
          label="Current investment for this goal"
          hint="Amount already saved for this specific goal"
          prefix="₹"
          value={form.currentInvestment}
          onChangeText={text => onChange({ currentInvestment: text })}
          keyboardType="number-pad"
        />
        <GoalInputField
          label="Expected return"
          suffix="% p.a."
          value={form.expectedReturn}
          onChangeText={text => onChange({ expectedReturn: text })}
          keyboardType="decimal-pad"
        />
        <GoalInputField
          label="Inflation rate"
          suffix="% p.a."
          value={form.inflationRate}
          onChangeText={text => onChange({ inflationRate: text })}
          keyboardType="decimal-pad"
        />
      </View>
    </GoalWizardShell>
  );
}

const styles = StyleSheet.create({
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EDE9FE',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  goalEmoji: {
    fontSize: 18,
  },
  goalName: {
    fontSize: 14,
    color: '#5E02AF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 16,
  },
  blockLabel: {
    fontSize: 14,
    color: '#374151',
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  chipActive: {
    borderColor: '#5E02AF',
    backgroundColor: '#F5F3FF',
  },
  chipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  chipTextActive: {
    color: '#5E02AF',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
    marginTop: -8,
  },
});

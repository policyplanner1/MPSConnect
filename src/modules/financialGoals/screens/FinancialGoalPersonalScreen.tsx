import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';
import GoalInputField from '../components/GoalInputField';
import GoalWizardShell from '../components/GoalWizardShell';
import type { GoalWizardFormState } from '../types/goalWizard.types';
import { isPersonalStepValid } from '../utils/goalWizardUtils';

type FinancialGoalPersonalScreenProps = {
  form: GoalWizardFormState;
  onChange: (patch: Partial<GoalWizardFormState>) => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function FinancialGoalPersonalScreen({
  form,
  onChange,
  onBack,
  onContinue,
}: FinancialGoalPersonalScreenProps) {
  const valid = isPersonalStepValid(form);

  return (
    <GoalWizardShell
      title="Your details"
      stepIndex={2}
      showProgress
      onBack={onBack}
      onPrimary={onContinue}
      primaryLabel="Next"
      primaryDisabled={!valid}
      footerNote="We keep this short — only basics to personalise your plan.">
      <View style={styles.card}>
        <GoalInputField
          label="Full name"
          value={form.fullName}
          onChangeText={text => onChange({ fullName: text })}
        />
        <GoalInputField
          label="Age"
          suffix="yrs"
          value={form.age}
          onChangeText={text => onChange({ age: text })}
          keyboardType="number-pad"
        />
        <GoalInputField
          label="City"
          value={form.city}
          onChangeText={text => onChange({ city: text })}
        />
        <GoalInputField
          label="Monthly income"
          prefix="₹"
          value={form.monthlyIncome}
          onChangeText={text => onChange({ monthlyIncome: text })}
          keyboardType="number-pad"
        />
        <GoalInputField
          label="Monthly expense"
          prefix="₹"
          value={form.monthlyExpense}
          onChangeText={text => onChange({ monthlyExpense: text })}
          keyboardType="number-pad"
        />
        <GoalInputField
          label="Existing savings"
          hint="Total savings across all goals"
          prefix="₹"
          value={form.existingSavings}
          onChangeText={text => onChange({ existingSavings: text })}
          keyboardType="number-pad"
        />
      </View>
    </GoalWizardShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 16,
  },
});

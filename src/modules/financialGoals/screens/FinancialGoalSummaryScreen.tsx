import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';
import GoalSummaryPreview from '../components/GoalSummaryPreview';
import GoalWizardShell from '../components/GoalWizardShell';
import { getGoalById } from '../constants/goalOptions';
import type { GoalWizardSnapshot } from '../types/goalWizard.types';

type FinancialGoalSummaryScreenProps = {
  snapshot: GoalWizardSnapshot;
  onBack: () => void;
  onViewFullPlan: () => void;
  onEditDetails: () => void;
};

export default function FinancialGoalSummaryScreen({
  snapshot,
  onBack,
  onViewFullPlan,
  onEditDetails,
}: FinancialGoalSummaryScreenProps) {
  const goal = getGoalById(snapshot.form.selectedGoalId);
  const name = snapshot.form.fullName.trim() || 'there';

  return (
    <GoalWizardShell
      title="Goal summary"
      stepIndex={4}
      showProgress
      onBack={onBack}
      onPrimary={onViewFullPlan}
      primaryLabel="View full plan"
      footerNote={`Hi ${name}, here is your ${goal.label} plan at a glance.`}>
      <View style={styles.congrats}>
        <Text style={styles.emoji}>✨</Text>
        <Text style={[styles.congratsTitle, inter18('bold')]}>Your plan is ready</Text>
        <Text style={[styles.congratsSub, inter18('regular')]}>
          Based on your goal details, here is what you need to reach {goal.label}.
        </Text>
      </View>

      <GoalSummaryPreview results={snapshot.results} />

      <Pressable onPress={onEditDetails} style={styles.secondaryBtn}>
        <Text style={[styles.secondaryBtnText, inter18('semiBold')]}>Edit details</Text>
      </Pressable>
    </GoalWizardShell>
  );
}

const styles = StyleSheet.create({
  congrats: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  emoji: {
    fontSize: 32,
  },
  congratsTitle: {
    fontSize: 18,
    color: '#111827',
  },
  congratsSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryBtnText: {
    fontSize: 15,
    color: '#5E02AF',
  },
});

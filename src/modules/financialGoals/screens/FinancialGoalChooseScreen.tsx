import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';
import GoalChooseCard from '../components/GoalChooseCard';
import GoalWizardShell from '../components/GoalWizardShell';
import { GOAL_TYPES, type GoalTypeId } from '../constants/goalOptions';
import { isChooseStepValid } from '../utils/goalWizardUtils';

type FinancialGoalChooseScreenProps = {
  selectedGoalId: GoalTypeId;
  onSelectGoal: (id: GoalTypeId) => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function FinancialGoalChooseScreen({
  selectedGoalId,
  onSelectGoal,
  onBack,
  onContinue,
}: FinancialGoalChooseScreenProps) {
  const valid = isChooseStepValid(selectedGoalId);

  return (
    <GoalWizardShell
      title="Choose your goal"
      stepIndex={1}
      showProgress
      onBack={onBack}
      onPrimary={onContinue}
      primaryLabel="Continue"
      primaryDisabled={!valid}>
      <Text style={[styles.intro, inter18('regular')]}>
        Select one financial goal to plan. You can change this later.
      </Text>
      <View style={styles.list}>
        {GOAL_TYPES.map(option => (
          <GoalChooseCard
            key={option.id}
            option={option}
            selected={option.id === selectedGoalId}
            onPress={() => onSelectGoal(option.id)}
          />
        ))}
      </View>
    </GoalWizardShell>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  list: {
    gap: 10,
  },
});

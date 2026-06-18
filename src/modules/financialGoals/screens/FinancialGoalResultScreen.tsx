import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalculatorHeader from '../../calculators/components/CalculatorHeader';
import { inter18 } from '../../../core/theme/typography';
import GoalPlanReport from '../components/GoalPlanReport';
import { getGoalById } from '../constants/goalOptions';
import type { GoalWizardSnapshot } from '../types/goalWizard.types';

type FinancialGoalResultScreenProps = {
  snapshot: GoalWizardSnapshot;
  onBack: () => void;
  onEditDetails: () => void;
  onStartOver: () => void;
};

export default function FinancialGoalResultScreen({
  snapshot,
  onBack,
  onEditDetails,
  onStartOver,
}: FinancialGoalResultScreenProps) {
  const goal = getGoalById(snapshot.form.selectedGoalId);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="Your full plan" />
      <View style={styles.stepBadge}>
        <Text style={[styles.stepBadgeText, inter18('semiBold')]}>Step 5 of 5 — Full plan</Text>
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalEmoji}>{goal.emoji}</Text>
          <View style={styles.goalHeaderText}>
            <Text style={[styles.goalTitle, inter18('bold')]}>{goal.label}</Text>
            <Text style={[styles.goalSub, inter18('regular')]}>
              Complete investment plan for {snapshot.form.fullName.trim() || 'you'}
            </Text>
          </View>
        </View>

        <GoalPlanReport results={snapshot.results} />

        <Text style={[styles.disclaimer, inter18('regular')]}>
          Estimates only. Actual returns and inflation may differ. Consult a financial advisor
          before investing.
        </Text>

        <Pressable onPress={onEditDetails} style={styles.secondaryBtn}>
          <Text style={[styles.secondaryBtnText, inter18('semiBold')]}>Edit details</Text>
        </Pressable>
        <Pressable onPress={onStartOver} style={styles.ghostBtn}>
          <Text style={[styles.ghostBtnText, inter18('medium')]}>Plan another goal</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  stepBadge: {
    backgroundColor: '#EDE9FE',
    paddingVertical: 8,
    alignItems: 'center',
  },
  stepBadgeText: {
    fontSize: 13,
    color: '#5E02AF',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  goalEmoji: {
    fontSize: 32,
  },
  goalHeaderText: {
    flex: 1,
    gap: 2,
  },
  goalTitle: {
    fontSize: 17,
    color: '#111827',
  },
  goalSub: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },
  disclaimer: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryBtnText: {
    fontSize: 15,
    color: '#5E02AF',
  },
  ghostBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  ghostBtnText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

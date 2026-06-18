import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';
import GoalWizardShell from '../components/GoalWizardShell';

type FinancialGoalWelcomeScreenProps = {
  onBack?: () => void;
  onContinue: () => void;
};

export default function FinancialGoalWelcomeScreen({
  onBack,
  onContinue,
}: FinancialGoalWelcomeScreenProps) {
  return (
    <GoalWizardShell
      title="Financial goal"
      onBack={onBack}
      onPrimary={onContinue}
      primaryLabel="Get started">
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🎯</Text>
        <Text style={[styles.heroTitle, inter18('bold')]}>Plan your financial goal</Text>
        <Text style={[styles.heroSub, inter18('regular')]}>
          Enter one goal, see how much to save with SIP or lumpsum, and get a simple action plan
          built for you.
        </Text>
      </View>

      <View style={styles.stepsCard}>
        <Text style={[styles.stepsTitle, inter18('semiBold')]}>What you will do</Text>
        {[
          'Choose your goal type',
          'Add basic personal details',
          'Enter goal amount & timeline',
          'Review your goal summary',
          'View your full investment plan',
        ].map((line, index) => (
          <View key={line} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={[styles.stepNumText, inter18('bold')]}>{index + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, inter18('regular')]}>{line}</Text>
          </View>
        ))}
      </View>
    </GoalWizardShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  heroEmoji: {
    fontSize: 48,
  },
  heroTitle: {
    fontSize: 22,
    color: '#111827',
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
  },
  stepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    gap: 12,
  },
  stepsTitle: {
    fontSize: 15,
    color: '#111827',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 13,
    color: '#5E02AF',
  },
  stepLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalculatorHeader from '../../calculators/components/CalculatorHeader';
import { inter18 } from '../../../core/theme/typography';
import GoalInputField from '../components/GoalInputField';
import GoalPlanReport from '../components/GoalPlanReport';
import GoalTypeChips from '../components/GoalTypeChips';
import {
  DEFAULT_INFLATION_PERCENT,
  DEFAULT_RETURN_PERCENT,
  GOAL_TYPES,
  INPUT_LIMITS,
  type GoalTypeOption,
} from '../constants/goalOptions';
import { computeFinancialGoalPlan } from '../services/goalCalculator';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function parseNum(raw: string): number {
  const n = parseFloat(raw.replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}

function formatAmountInput(n: number): string {
  if (!Number.isFinite(n) || n <= 0) {
    return '';
  }
  return String(Math.round(n));
}

type FinancialGoalPlannerScreenProps = {
  onBack?: () => void;
};

export default function FinancialGoalPlannerScreen({ onBack }: FinancialGoalPlannerScreenProps) {
  const [selectedGoal, setSelectedGoal] = useState<GoalTypeOption>(GOAL_TYPES[2]);
  const [costText, setCostText] = useState(formatAmountInput(selectedGoal.defaultCost));
  const [alreadyHaveText, setAlreadyHaveText] = useState('');
  const [yearsText, setYearsText] = useState(String(selectedGoal.defaultYears));
  const [inflationText, setInflationText] = useState(String(DEFAULT_INFLATION_PERCENT));
  const [returnText, setReturnText] = useState(String(DEFAULT_RETURN_PERCENT));

  const handleGoalSelect = useCallback((option: GoalTypeOption) => {
    setSelectedGoal(option);
    setCostText(formatAmountInput(option.defaultCost));
    setYearsText(String(option.defaultYears));
  }, []);

  const inputs = useMemo(() => {
    const currentGoalCost = clamp(
      parseNum(costText),
      INPUT_LIMITS.minCost,
      INPUT_LIMITS.maxCost,
    );
    const amountAlreadyHave = clamp(
      parseNum(alreadyHaveText),
      INPUT_LIMITS.minAlreadyHave,
      INPUT_LIMITS.maxAlreadyHave,
    );
    const yearsToGoal = clamp(
      parseNum(yearsText),
      INPUT_LIMITS.minYears,
      INPUT_LIMITS.maxYears,
    );
    const inflationRatePercent = clamp(
      parseNum(inflationText),
      INPUT_LIMITS.minInflation,
      INPUT_LIMITS.maxInflation,
    );
    const expectedReturnPercent = clamp(
      parseNum(returnText),
      INPUT_LIMITS.minReturn,
      INPUT_LIMITS.maxReturn,
    );

    return {
      currentGoalCost,
      amountAlreadyHave,
      yearsToGoal,
      inflationRatePercent,
      expectedReturnPercent,
    };
  }, [costText, alreadyHaveText, yearsText, inflationText, returnText]);

  const results = useMemo(() => computeFinancialGoalPlan(inputs), [inputs]);

  const blurCost = useCallback(() => {
    setCostText(formatAmountInput(inputs.currentGoalCost));
  }, [inputs.currentGoalCost]);

  const blurAlreadyHave = useCallback(() => {
    setAlreadyHaveText(formatAmountInput(inputs.amountAlreadyHave));
  }, [inputs.amountAlreadyHave]);

  const blurYears = useCallback(() => {
    setYearsText(String(inputs.yearsToGoal));
  }, [inputs.yearsToGoal]);

  const blurInflation = useCallback(() => {
    setInflationText(String(inputs.inflationRatePercent));
  }, [inputs.inflationRatePercent]);

  const blurReturn = useCallback(() => {
    setReturnText(String(inputs.expectedReturnPercent));
  }, [inputs.expectedReturnPercent]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="Financial goal planner" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>{selectedGoal.emoji}</Text>
            <Text style={[styles.heroTitle, inter18('bold')]}>{selectedGoal.label}</Text>
            <Text style={[styles.heroSub, inter18('regular')]}>
              Plan how much your goal will cost in the future, and how much to save via SIP or
              lumpsum.
            </Text>
          </View>

          <Text style={[styles.sectionLabel, inter18('semiBold')]}>Choose your goal</Text>
          <GoalTypeChips
            options={GOAL_TYPES}
            selectedId={selectedGoal.id}
            onSelect={handleGoalSelect}
          />

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, inter18('semiBold')]}>Your details</Text>
            <View style={styles.formCard}>
              <GoalInputField
                label="Current goal cost (today)"
                hint="What this goal would cost if you paid today"
                prefix="₹"
                value={costText}
                onChangeText={setCostText}
                onBlur={blurCost}
              />
              <GoalInputField
                label="You already have (saved so far)"
                hint="Savings already set aside for this goal"
                prefix="₹"
                value={alreadyHaveText}
                onChangeText={setAlreadyHaveText}
                onBlur={blurAlreadyHave}
              />
              <GoalInputField
                label="Years to reach goal"
                suffix="yrs"
                value={yearsText}
                onChangeText={setYearsText}
                onBlur={blurYears}
              />
              <GoalInputField
                label="Expected inflation"
                hint="Annual inflation rate"
                suffix="% p.a."
                value={inflationText}
                onChangeText={setInflationText}
                onBlur={blurInflation}
                keyboardType="decimal-pad"
              />
              <GoalInputField
                label="Expected return on investment"
                hint="Annual return for SIP / lumpsum"
                suffix="% p.a."
                value={returnText}
                onChangeText={setReturnText}
                onBlur={blurReturn}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, inter18('semiBold')]}>Your plan report</Text>
            <View style={styles.results}>
              <GoalPlanReport results={results} />
            </View>
          </View>

          <View style={styles.disclaimer}>
            <Text style={[styles.disclaimerText, inter18('regular')]}>
              Estimates only. Actual returns and inflation may differ. SIP assumes monthly
              investments at the beginning of each month. Consult a financial advisor before
              investing.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 32,
    gap: 16,
  },
  hero: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  heroEmoji: {
    fontSize: 36,
  },
  heroTitle: {
    fontSize: 20,
    color: '#111827',
  },
  heroSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 15,
    color: '#111827',
    paddingHorizontal: 16,
  },
  formCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 16,
  },
  results: {
    paddingHorizontal: 16,
    gap: 10,
  },
  disclaimer: {
    marginHorizontal: 16,
    paddingHorizontal: 4,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
    textAlign: 'center',
  },
});

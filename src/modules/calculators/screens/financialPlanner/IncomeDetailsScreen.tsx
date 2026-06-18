import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import CalculatorHeader from '../../components/CalculatorHeader';
import PlannerCurrencyInput from '../../components/PlannerCurrencyInput';
import type { FinancialProfile } from '../../types/financialPlanner';
import { totalMonthlyIncome } from '../../utils/financialPlannerEngine';
import { formatInr, parseAmount } from '../../utils/formatter';
import { inter18 } from '../../../../core/theme/typography';

type IncomeDetailsScreenProps = {
  profile: FinancialProfile;
  onBack: () => void;
  onSave: (profile: FinancialProfile) => void;
  isFirstSetup?: boolean;
};

function InfoIcon() {
  return (
    <Svg height={16} viewBox="0 0 24 24" width={16}>
      <Circle cx={12} cy={12} fill="#2563EB" r={10} />
      <Path d="M12 10v6M12 8h.01" stroke="#FFFFFF" strokeLinecap="round" strokeWidth={2} />
    </Svg>
  );
}

function IncomeDetailsScreen({
  profile,
  onBack,
  onSave,
  isFirstSetup = false,
}: IncomeDetailsScreenProps) {
  const [salaryStr, setSalaryStr] = useState(
    profile.monthlySalary > 0 ? String(profile.monthlySalary) : '',
  );
  const [otherStr, setOtherStr] = useState(
    profile.otherIncome > 0 ? String(profile.otherIncome) : '',
  );

  const draftProfile = useMemo(
    (): FinancialProfile => ({
      monthlySalary: parseAmount(salaryStr),
      otherIncome: parseAmount(otherStr),
      updatedAt: new Date().toISOString(),
    }),
    [salaryStr, otherStr],
  );

  const total = totalMonthlyIncome(draftProfile);
  const canProceed = draftProfile.monthlySalary > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="PlanWealth" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.heading, inter18('bold')]}>Income Details</Text>
          <Text style={[styles.sub, inter18('regular')]}>
            Please enter customer's monthly income details.
          </Text>

          <PlannerCurrencyInput
            required
            label="Monthly Income (Salary / Business)"
            value={salaryStr}
            onChangeText={setSalaryStr}
            placeholder="50,000"
          />
          <PlannerCurrencyInput
            label="Other Income (Rent, Interest, etc.)"
            value={otherStr}
            onChangeText={setOtherStr}
            placeholder="5,000"
          />

          <View style={styles.totalBox}>
            <Text style={[styles.totalLabel, inter18('semiBold')]}>Total Monthly Income</Text>
            <Text style={[styles.totalValue, inter18('bold')]}>₹ {formatInr(total)}</Text>
          </View>

          <View style={styles.infoRow}>
            <InfoIcon />
            <Text style={[styles.infoText, inter18('regular')]}>
              Please include all sources of income.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            disabled={!canProceed}
            onPress={() => onSave(draftProfile)}
            style={({ pressed }) => [
              styles.primaryBtn,
              !canProceed && styles.primaryBtnDisabled,
              pressed && canProceed && styles.primaryBtnPressed,
            ]}>
            <Text style={[styles.primaryBtnText, inter18('bold')]}>
              {isFirstSetup ? 'Save & continue' : 'Save income'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 18,
  },
  heading: { fontSize: 22, color: '#111111' },
  sub: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 4 },
  totalBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 16,
    gap: 6,
    marginTop: 4,
  },
  totalLabel: { fontSize: 14, color: '#1D4ED8' },
  totalValue: { fontSize: 26, color: '#111111' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: { flex: 1, fontSize: 12, color: '#6B7280' },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnDisabled: { backgroundColor: '#93C5FD' },
  primaryBtnPressed: { opacity: 0.9 },
  primaryBtnText: { fontSize: 16, color: '#FFFFFF' },
});

export default IncomeDetailsScreen;

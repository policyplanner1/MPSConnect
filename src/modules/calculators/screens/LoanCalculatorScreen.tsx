import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalculatorHeader from '../components/CalculatorHeader';
import EmiDonutChart from '../components/EmiDonutChart';
import { baselineTotals, computeEMI } from '../utils/emiFormula';
import { formatInr } from '../utils/formatter';
import { inter18 } from '../../../core/theme/typography';

const MIN_LOAN = 10_000;
const MAX_LOAN = 5_00_00_000;
const MIN_RATE = 0.5;
const MAX_RATE = 24;
const MIN_YEARS = 1;
const MAX_YEARS = 40;

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

type LoanCalculatorScreenProps = {
  onBack?: () => void;
};

function LoanInputField({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  keyboardType = 'number-pad',
  suffix,
  prefix,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  keyboardType?: 'decimal-pad' | 'number-pad';
  suffix?: string;
  prefix?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, inter18('medium')]}>{label}</Text>
      <View style={styles.inputRow}>
        {prefix ? (
          <Text style={[styles.inputAffix, inter18('semiBold')]}>{prefix}</Text>
        ) : null}
        <TextInput
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          style={[styles.input, inter18('regular')]}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
        />
        {suffix ? (
          <Text style={[styles.inputAffix, inter18('semiBold')]}>{suffix}</Text>
        ) : null}
      </View>
    </View>
  );
}

function LoanCalculatorScreen({ onBack }: LoanCalculatorScreenProps) {
  const [principal, setPrincipal] = useState(500_000);
  const [loanStr, setLoanStr] = useState('500000');
  const [rate, setRate] = useState(9);
  const [rateStr, setRateStr] = useState('9');
  const [years, setYears] = useState(5);
  const [yearsStr, setYearsStr] = useState('5');

  const onLoanText = useCallback((t: string) => {
    const d = t.replace(/\D/g, '');
    setLoanStr(d);
    if (d === '') {
      setPrincipal(0);
      return;
    }
    const parsed = parseInt(d, 10);
    if (Number.isFinite(parsed)) {
      setPrincipal(clamp(parsed, 0, MAX_LOAN));
    }
  }, []);

  const onLoanBlur = useCallback(() => {
    if (loanStr === '' || parseInt(loanStr, 10) < MIN_LOAN) {
      setPrincipal(MIN_LOAN);
      setLoanStr(String(MIN_LOAN));
    }
  }, [loanStr]);

  const onRateText = useCallback((t: string) => {
    const cleaned = t.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    let next =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
    if (next.startsWith('.')) {
      next = `0${next}`;
    }
    setRateStr(next);
    const n = parseFloat(next);
    if (Number.isFinite(n)) {
      setRate(clamp(n, 0, MAX_RATE));
    }
  }, []);

  const onRateBlur = useCallback(() => {
    const n = parseFloat(rateStr);
    if (!Number.isFinite(n) || rateStr === '' || rateStr === '.') {
      setRate(9);
      setRateStr('9');
      return;
    }
    const r = clamp(Math.round(n * 10) / 10, MIN_RATE, MAX_RATE);
    setRate(r);
    setRateStr(r.toFixed(1));
  }, [rateStr]);

  const onYearsText = useCallback((t: string) => {
    const d = t.replace(/\D/g, '');
    setYearsStr(d);
    if (d === '') {
      return;
    }
    const parsed = parseInt(d, 10);
    if (Number.isFinite(parsed)) {
      setYears(clamp(parsed, 0, MAX_YEARS));
    }
  }, []);

  const onYearsBlur = useCallback(() => {
    if (yearsStr === '' || parseInt(yearsStr, 10) < MIN_YEARS) {
      setYears(MIN_YEARS);
      setYearsStr(String(MIN_YEARS));
    } else {
      const y = clamp(parseInt(yearsStr, 10), MIN_YEARS, MAX_YEARS);
      setYears(y);
      setYearsStr(String(y));
    }
  }, [yearsStr]);

  const n = years * 12;
  const emi = useMemo(() => computeEMI(principal, rate, n), [principal, rate, n]);
  const base = useMemo(
    () => baselineTotals(principal, rate, n),
    [principal, rate, n],
  );

  const valid = principal >= MIN_LOAN && years >= MIN_YEARS;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="Loan Calculator" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={88}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <LoanInputField
              label="Loan amount"
              placeholder="Min 10,000"
              prefix="₹"
              value={loanStr}
              onBlur={onLoanBlur}
              onChangeText={onLoanText}
            />
            <LoanInputField
              label="Rate of interest (p.a)"
              placeholder="e.g. 9"
              suffix="%"
              value={rateStr}
              keyboardType="decimal-pad"
              onBlur={onRateBlur}
              onChangeText={onRateText}
            />
            <LoanInputField
              label="Loan tenure (in years)"
              placeholder="e.g. 5"
              value={yearsStr}
              onBlur={onYearsBlur}
              onChangeText={onYearsText}
            />
          </View>

          <View style={styles.chartSection}>
            <EmiDonutChart
              principal={principal}
              totalInterest={valid ? base.totalInterest : 0}
            />
          </View>

          <View style={styles.summary}>
            <SummaryLine
              emphasis
              label="Monthly EMI"
              value={valid ? `₹ ${formatInr(emi)}` : '—'}
            />
            <SummaryLine
              label="Principal amount"
              value={valid ? `₹ ${formatInr(principal)}` : '—'}
            />
            <SummaryLine
              label="Total interest"
              value={valid ? `₹ ${formatInr(base.totalInterest)}` : '—'}
            />
            <SummaryLine
              label="Total amount"
              value={valid ? `₹ ${formatInr(base.totalPaid)}` : '—'}
            />
            {!valid ? (
              <Text style={[styles.warn, inter18('regular')]}>
                Enter loan amount (min ₹{formatInr(MIN_LOAN)}) and tenure.
              </Text>
            ) : null}
          </View>

          <Text style={[styles.disclaimer, inter18('regular')]}>
            Illustration only. Actual loan terms depend on your lender.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SummaryLine({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, inter18('medium')]}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          inter18(emphasis ? 'bold' : 'semiBold'),
          emphasis && styles.summaryEmphasis,
        ]}>
        {value}
      </Text>
    </View>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#3F3F46',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    margin: 0,
    minWidth: 0,
  },
  inputAffix: {
    fontSize: 16,
    color: '#111111',
    marginRight: 4,
  },
  chartSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    paddingVertical: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  summary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  summaryValue: {
    fontSize: 15,
    color: '#111111',
    textAlign: 'right',
    marginLeft: 12,
  },
  summaryEmphasis: {
    fontSize: 18,
    color: '#5E02AF',
  },
  warn: {
    marginTop: 8,
    fontSize: 12,
    color: '#B45309',
  },
  disclaimer: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
  },
});

export default LoanCalculatorScreen;

import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalculatorHeader from '../components/CalculatorHeader';
import EmiDonutChart from '../components/EmiDonutChart';
import {
  baselineTotals,
  computeEMI,
  simulateLoanWithExtraPayments,
  type ExtraPayMode,
} from '../utils/emiFormula';
import { formatInr, formatInrDecimals } from '../utils/formatter';
import { inter18 } from '../../../core/theme/typography';

const MIN_PRINCIPAL = 10_000;
const MAX_PRINCIPAL = 5_00_00_000;
const MIN_RATE = 0.5;
const MAX_RATE = 24;
const MIN_YEARS = 1;
const MAX_YEARS = 40;
const MIN_MONTHS = 1;
const MAX_MONTHS = MAX_YEARS * 12;
const MAX_EXTRA = 5_00_000;

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

type TenureUnit = 'year' | 'month';

type EMICalculatorScreenProps = {
  onBack?: () => void;
};

function UnitToggle<T extends string>({
  left,
  right,
  value,
  onChange,
  leftKey,
  rightKey,
}: {
  left: string;
  right: string;
  value: T;
  onChange: (v: T) => void;
  leftKey: T;
  rightKey: T;
}) {
  return (
    <View style={styles.segment}>
      <Pressable
        onPress={() => onChange(leftKey)}
        style={[styles.segmentBtn, value === leftKey && styles.segmentBtnActive]}>
        <Text
          style={[
            styles.segmentText,
            inter18(value === leftKey ? 'semiBold' : 'regular'),
            value === leftKey && styles.segmentTextActive,
          ]}>
          {left}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange(rightKey)}
        style={[styles.segmentBtn, value === rightKey && styles.segmentBtnActive]}>
        <Text
          style={[
            styles.segmentText,
            inter18(value === rightKey ? 'semiBold' : 'regular'),
            value === rightKey && styles.segmentTextActive,
          ]}>
          {right}
        </Text>
      </Pressable>
    </View>
  );
}

function EmiInputField({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  keyboardType = 'decimal-pad',
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

function EMICalculatorScreen({ onBack }: EMICalculatorScreenProps) {
  const [principal, setPrincipal] = useState(100_000);
  const [loanStr, setLoanStr] = useState('100000');
  const [rate, setRate] = useState(8.5);
  const [rateStr, setRateStr] = useState('8.5');

  const [tenureMonths, setTenureMonths] = useState(60);
  const [tenureStr, setTenureStr] = useState('5');
  const [tenureUnit, setTenureUnit] = useState<TenureUnit>('year');

  const [extraAmount, setExtraAmount] = useState(0);
  const [extraStr, setExtraStr] = useState('0');
  const [extraMode, setExtraMode] = useState<ExtraPayMode>('year');

  const onLoanText = useCallback((t: string) => {
    const d = t.replace(/\D/g, '');
    setLoanStr(d);
    if (d === '') {
      setPrincipal(0);
      return;
    }
    const parsed = parseInt(d, 10);
    if (Number.isFinite(parsed)) {
      setPrincipal(clamp(parsed, 0, MAX_PRINCIPAL));
    }
  }, []);

  const onLoanBlur = useCallback(() => {
    if (loanStr === '' || parseInt(loanStr, 10) < MIN_PRINCIPAL) {
      setPrincipal(MIN_PRINCIPAL);
      setLoanStr(String(MIN_PRINCIPAL));
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
      setRate(8.5);
      setRateStr('8.5');
      return;
    }
    const r = clamp(Math.round(n * 10) / 10, MIN_RATE, MAX_RATE);
    setRate(r);
    setRateStr(r.toFixed(1));
  }, [rateStr]);

  const onTenureUnitChange = useCallback(
    (u: TenureUnit) => {
      if (u === tenureUnit) {
        return;
      }
      if (u === 'year') {
        const snapped = Math.max(12, Math.round(tenureMonths / 12) * 12);
        setTenureMonths(snapped);
        setTenureStr(String(snapped / 12));
      } else {
        setTenureStr(String(tenureMonths));
      }
      setTenureUnit(u);
    },
    [tenureUnit, tenureMonths],
  );

  const onTenureText = useCallback(
    (t: string) => {
      const d = t.replace(/\D/g, '');
      setTenureStr(d);
      if (d === '') {
        return;
      }
      const parsed = parseInt(d, 10);
      if (!Number.isFinite(parsed)) {
        return;
      }
      if (tenureUnit === 'year') {
        const y = clamp(parsed, 0, MAX_YEARS);
        setTenureMonths(y * 12);
      } else {
        const m = clamp(parsed, 0, MAX_MONTHS);
        setTenureMonths(m);
      }
    },
    [tenureUnit],
  );

  const onTenureBlur = useCallback(() => {
    if (tenureStr === '') {
      if (tenureUnit === 'year') {
        setTenureMonths(12);
        setTenureStr('1');
      } else {
        setTenureMonths(MIN_MONTHS);
        setTenureStr(String(MIN_MONTHS));
      }
      return;
    }
    if (tenureUnit === 'year') {
      const y = clamp(parseInt(tenureStr, 10), MIN_YEARS, MAX_YEARS);
      setTenureMonths(y * 12);
      setTenureStr(String(y));
    } else {
      const m = clamp(parseInt(tenureStr, 10), MIN_MONTHS, MAX_MONTHS);
      setTenureMonths(m);
      setTenureStr(String(m));
    }
  }, [tenureStr, tenureUnit]);

  const onExtraText = useCallback((t: string) => {
    const d = t.replace(/\D/g, '');
    setExtraStr(d);
    if (d === '') {
      setExtraAmount(0);
      return;
    }
    const e = clamp(parseInt(d, 10), 0, MAX_EXTRA);
    setExtraAmount(e);
  }, []);

  const onExtraBlur = useCallback(() => {
    if (extraStr === '') {
      setExtraAmount(0);
      setExtraStr('0');
    }
  }, [extraStr]);

  const n = tenureMonths;
  const emi = useMemo(() => computeEMI(principal, rate, n), [principal, rate, n]);
  const base = useMemo(
    () => baselineTotals(principal, rate, n),
    [principal, rate, n],
  );
  const sim = useMemo(
    () =>
      simulateLoanWithExtraPayments(
        principal,
        rate,
        n,
        extraAmount,
        extraMode,
      ),
    [principal, rate, n, extraAmount, extraMode],
  );

  const valid = principal >= MIN_PRINCIPAL && n > 0;
  const showExtraInsight = valid && extraAmount > 0 && emi > 0;
  const tenurePlaceholder = tenureUnit === 'year' ? 'e.g. 20' : 'e.g. 240';
  const tenureSuffix = tenureUnit === 'year' ? 'Yr' : 'Mo';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="EMI Calculator" />
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
            <EmiInputField
              label="Loan amount (₹)"
              placeholder="Min 10,000"
              value={loanStr}
              keyboardType="number-pad"
              onBlur={onLoanBlur}
              onChangeText={onLoanText}
            />

            <EmiInputField
              label="Rate of interest (p.a)"
              placeholder="e.g. 8.5"
              suffix="%"
              value={rateStr}
              onBlur={onRateBlur}
              onChangeText={onRateText}
            />

            <View style={styles.field}>
              <View style={styles.fieldHeader}>
                <Text style={[styles.label, inter18('medium')]}>Loan tenure</Text>
                <UnitToggle<TenureUnit>
                  left="Years"
                  leftKey="year"
                  right="Months"
                  rightKey="month"
                  value={tenureUnit}
                  onChange={onTenureUnitChange}
                />
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  keyboardType="number-pad"
                  placeholder={tenurePlaceholder}
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input, inter18('regular')]}
                  value={tenureStr}
                  onChangeText={onTenureText}
                  onBlur={onTenureBlur}
                />
                <Text style={[styles.inputAffix, inter18('semiBold')]}>{tenureSuffix}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.fieldHeader}>
                <Text style={[styles.label, inter18('medium')]}>Extra payment</Text>
                <UnitToggle<ExtraPayMode>
                  left="Per year"
                  leftKey="year"
                  right="Per month"
                  rightKey="month"
                  value={extraMode}
                  onChange={setExtraMode}
                />
              </View>
              <Text style={[styles.hint, inter18('regular')]}>
                {extraMode === 'year'
                  ? 'Applied once every 12 months after that month’s EMI.'
                  : 'Applied every month on top of your EMI principal.'}
              </Text>
              <View style={styles.inputRow}>
                <Text style={[styles.inputAffix, inter18('semiBold')]}>₹</Text>
                <TextInput
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input, inter18('regular')]}
                  value={extraStr}
                  onChangeText={onExtraText}
                  onBlur={onExtraBlur}
                />
              </View>
            </View>
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
            {showExtraInsight ? (
              <>
                <View style={styles.divider} />
                <Text style={[styles.extraSummaryTitle, inter18('semiBold')]}>
                  With extra payments
                </Text>
                <SummaryLine
                  label="Loan closes in"
                  value={`${sim.monthsToClose} mo`}
                />
                <SummaryLine
                  label="Total paid"
                  value={`₹ ${formatInrDecimals(sim.totalPaid)}`}
                />
                <SummaryLine
                  label="Total interest"
                  value={`₹ ${formatInrDecimals(sim.totalInterest)}`}
                />
                {sim.monthsToClose < n ? (
                  <Text style={[styles.savedHint, inter18('regular')]}>
                    About {n - sim.monthsToClose} month(s) earlier than the original{' '}
                    {n}-month term.
                  </Text>
                ) : null}
              </>
            ) : null}
            {!valid ? (
              <Text style={[styles.warn, inter18('regular')]}>
                Enter loan amount (min ₹{formatInr(MIN_PRINCIPAL)}) and tenure.
              </Text>
            ) : null}
          </View>

          <Text style={[styles.disclaimer, inter18('regular')]}>
            Illustration only. Actual terms depend on your lender.
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
          emphasis && styles.summaryEmi,
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
    gap: 0,
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
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  label: {
    fontSize: 13,
    color: '#3F3F46',
    flex: 1,
  },
  hint: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
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
    paddingHorizontal: 0,
    margin: 0,
    minWidth: 0,
  },
  inputAffix: {
    fontSize: 16,
    color: '#111111',
    marginRight: 4,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 11,
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#5E02AF',
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
  summaryEmi: {
    fontSize: 18,
    color: '#111111',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  extraSummaryTitle: {
    fontSize: 13,
    color: '#5E02AF',
    marginBottom: 4,
  },
  savedHint: {
    fontSize: 12,
    color: '#15803D',
    marginTop: 8,
    lineHeight: 17,
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

export default EMICalculatorScreen;

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
import { computeSipFutureValue, type SipFrequency } from '../utils/sipFormula';
import { formatInr } from '../utils/formatter';
import { inter18 } from '../../../core/theme/typography';

const MIN_SIP = 500;
const MAX_SIP = 10_00_000;
const MIN_RATE = 0;
const MAX_RATE = 30;
const MIN_YEARS = 1;
const MAX_YEARS = 40;

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

type SIPCalculatorScreenProps = {
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

function SipInputField({
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

function SIPCalculatorScreen({ onBack }: SIPCalculatorScreenProps) {
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipStr, setSipStr] = useState('5000');
  const [rate, setRate] = useState(12);
  const [rateStr, setRateStr] = useState('12');
  const [years, setYears] = useState(10);
  const [yearsStr, setYearsStr] = useState('10');
  const [frequency, setFrequency] = useState<SipFrequency>('monthly');

  const onSipText = useCallback((t: string) => {
    const d = t.replace(/\D/g, '');
    setSipStr(d);
    if (d === '') {
      setSipAmount(0);
      return;
    }
    const parsed = parseInt(d, 10);
    if (Number.isFinite(parsed)) {
      setSipAmount(clamp(parsed, 0, MAX_SIP));
    }
  }, []);

  const onSipBlur = useCallback(() => {
    if (sipStr === '' || parseInt(sipStr, 10) < MIN_SIP) {
      setSipAmount(MIN_SIP);
      setSipStr(String(MIN_SIP));
    }
  }, [sipStr]);

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
      setRate(clamp(n, MIN_RATE, MAX_RATE));
    }
  }, []);

  const onRateBlur = useCallback(() => {
    const n = parseFloat(rateStr);
    if (!Number.isFinite(n) || rateStr === '' || rateStr === '.') {
      setRate(12);
      setRateStr('12');
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

  const result = useMemo(
    () => computeSipFutureValue(sipAmount, rate, years, frequency),
    [sipAmount, rate, years, frequency],
  );

  const valid = sipAmount >= MIN_SIP && years >= MIN_YEARS;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="SIP Calculator" />
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
            <SipInputField
              label="SIP amount"
              placeholder="Min 500"
              prefix="₹"
              value={sipStr}
              onBlur={onSipBlur}
              onChangeText={onSipText}
            />

            <View style={styles.field}>
              <View style={styles.fieldHeader}>
                <Text style={[styles.label, inter18('medium')]}>Investment frequency</Text>
                <UnitToggle<SipFrequency>
                  left="Monthly"
                  leftKey="monthly"
                  right="Quarterly"
                  rightKey="quarterly"
                  value={frequency}
                  onChange={setFrequency}
                />
              </View>
            </View>

            <SipInputField
              label="Expected rate of returns (p.a)"
              placeholder="e.g. 12"
              suffix="%"
              value={rateStr}
              keyboardType="decimal-pad"
              onBlur={onRateBlur}
              onChangeText={onRateText}
            />

            <SipInputField
              label="Investment duration (in years)"
              placeholder="e.g. 10"
              value={yearsStr}
              onBlur={onYearsBlur}
              onChangeText={onYearsText}
            />
          </View>

          <View style={styles.summary}>
            <SummaryLine
              emphasis
              label="Estimated future value"
              value={valid ? `₹ ${formatInr(result.futureValue)}` : '—'}
            />
            <SummaryLine
              label="Total amount invested"
              value={valid ? `₹ ${formatInr(result.totalInvested)}` : '—'}
            />
            <SummaryLine
              label="Estimated returns"
              value={valid ? `₹ ${formatInr(result.estimatedReturns)}` : '—'}
            />
            {!valid ? (
              <Text style={[styles.warn, inter18('regular')]}>
                Enter SIP amount (min ₹{formatInr(MIN_SIP)}) and duration (min {MIN_YEARS}{' '}
                year).
              </Text>
            ) : null}
          </View>

          <Text style={[styles.disclaimer, inter18('regular')]}>
            Disclaimer: Please note that these calculators are for illustrations only and
            do not represent actual returns. Stock Market does not have a fixed rate of
            return and it is not possible to predict the rate of return.
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
    color: '#6B7280',
    lineHeight: 16,
  },
});

export default SIPCalculatorScreen;

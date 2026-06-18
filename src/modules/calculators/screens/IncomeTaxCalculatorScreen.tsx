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
import IncomeTaxSlabBars from '../components/IncomeTaxSlabBars';
import {
  DOMESTIC_COMPANY_RATE_OPTIONS,
  TAXPAYER_OPTIONS,
  type DomesticCompanyRate,
  type TaxpayerType,
} from '../constants/incomeTaxPayers';
import {
  calculateIncomeTax,
  type AgeCategory,
  type IncomeTaxInputs,
  type IncomeTaxResult,
  type TaxRegime,
} from '../utils/incomeTaxFormula';
import { formatInr, parseAmount } from '../utils/formatter';
import { inter18 } from '../../../core/theme/typography';

const ACCENT = '#0F6E56';

type IncomeTaxCalculatorScreenProps = {
  onBack?: () => void;
};

const AGE_OPTIONS: { idx: AgeCategory; title: string; range: string }[] = [
  { idx: 0, title: 'Below 60', range: 'General' },
  { idx: 1, title: '60–80 yrs', range: 'Senior' },
  { idx: 2, title: 'Above 80', range: 'Super senior' },
];

function fmtInr(n: number): string {
  return `₹ ${formatInr(n)}`;
}

function TaxInputField({
  label,
  value,
  onChangeText,
  placeholder,
  prefix = '₹',
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
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
          keyboardType="number-pad"
          placeholder={placeholder ?? '0'}
          placeholderTextColor="#9CA3AF"
          style={[styles.input, inter18('regular')]}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}

function RegimeToggle({
  regime,
  onChange,
}: {
  regime: TaxRegime;
  onChange: (r: TaxRegime) => void;
}) {
  return (
    <View style={styles.segment}>
      <Pressable
        onPress={() => onChange('new')}
        style={[styles.segmentBtn, regime === 'new' && styles.segmentBtnActive]}>
        <Text
          style={[
            styles.segmentText,
            inter18(regime === 'new' ? 'semiBold' : 'regular'),
            regime === 'new' && styles.segmentTextActive,
          ]}>
          New regime
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('old')}
        style={[styles.segmentBtn, regime === 'old' && styles.segmentBtnActive]}>
        <Text
          style={[
            styles.segmentText,
            inter18(regime === 'old' ? 'semiBold' : 'regular'),
            regime === 'old' && styles.segmentTextActive,
          ]}>
          Old regime
        </Text>
      </Pressable>
    </View>
  );
}

function SummaryLine({
  label,
  value,
  emphasis = false,
  valueColor,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  valueColor?: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, inter18('medium')]}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          inter18(emphasis ? 'bold' : 'semiBold'),
          emphasis && styles.summaryEmphasis,
          valueColor ? { color: valueColor } : null,
        ]}>
        {value}
      </Text>
    </View>
  );
}

function IncomeTaxCalculatorScreen({ onBack }: IncomeTaxCalculatorScreenProps) {
  const [taxpayerType, setTaxpayerType] = useState<TaxpayerType>('individual');
  const [regime, setRegime] = useState<TaxRegime>('new');
  const [ageIdx, setAgeIdx] = useState<AgeCategory>(0);
  const [domesticRate, setDomesticRate] = useState<DomesticCompanyRate>('30');
  const [coopOpt115BAD, setCoopOpt115BAD] = useState(false);
  const [result, setResult] = useState<IncomeTaxResult | null>(null);

  const [salary, setSalary] = useState('');
  const [rental, setRental] = useState('');
  const [other, setOther] = useState('');
  const [interest, setInterest] = useState('');
  const [totalIncome, setTotalIncome] = useState('');
  const [sec80C, setSec80C] = useState('');
  const [sec80D, setSec80D] = useState('');
  const [hra, setHra] = useState('');
  const [homeLoan, setHomeLoan] = useState('');
  const [sec80E, setSec80E] = useState('');
  const [nps, setNps] = useState('');

  const numField = (setter: (s: string) => void) => (text: string) => {
    setter(text.replace(/[^0-9]/g, ''));
  };

  const cappedField =
    (setter: (s: string) => void, max: number) => (text: string) => {
      const cleaned = text.replace(/[^0-9]/g, '');
      if (cleaned !== '') {
        const n = parseInt(cleaned, 10);
        if (n > max) {
          setter(String(max));
          return;
        }
      }
      setter(cleaned);
    };

  const usesRegime =
    taxpayerType === 'individual' || taxpayerType === 'huf' || taxpayerType === 'aopBoi';
  const isIndividual = taxpayerType === 'individual';
  const usesSimpleIncome =
    taxpayerType === 'firm' ||
    taxpayerType === 'domesticCompany' ||
    taxpayerType === 'foreignCompany' ||
    taxpayerType === 'cooperative' ||
    taxpayerType === 'localAuthority';

  const buildInputs = useCallback((): IncomeTaxInputs => {
    return {
      taxpayerType,
      regime,
      ageIdx,
      salary: parseAmount(salary),
      rental: parseAmount(rental),
      other: parseAmount(other),
      interest: parseAmount(interest),
      totalIncome: parseAmount(totalIncome),
      sec80C: parseAmount(sec80C),
      sec80D: parseAmount(sec80D),
      hra: parseAmount(hra),
      homeLoanInterest: parseAmount(homeLoan),
      sec80E: parseAmount(sec80E),
      nps: parseAmount(nps),
      domesticCompanyRate: domesticRate,
      coopOpt115BAD,
    };
  }, [
    taxpayerType,
    regime,
    ageIdx,
    salary,
    rental,
    other,
    interest,
    totalIncome,
    sec80C,
    sec80D,
    hra,
    homeLoan,
    sec80E,
    nps,
    domesticRate,
    coopOpt115BAD,
  ]);

  const hasIncome = useMemo(() => {
    if (usesSimpleIncome) {
      return parseAmount(totalIncome) > 0;
    }
    if (isIndividual) {
      return (
        parseAmount(salary) +
          parseAmount(rental) +
          parseAmount(other) +
          parseAmount(interest) >
        0
      );
    }
    return parseAmount(totalIncome) > 0 || parseAmount(salary) > 0;
  }, [
    usesSimpleIncome,
    isIndividual,
    totalIncome,
    salary,
    rental,
    other,
    interest,
  ]);

  const handleCalculate = () => {
    setResult(calculateIncomeTax(buildInputs()));
  };

  const handleTaxpayerChange = (id: TaxpayerType) => {
    setTaxpayerType(id);
    setResult(null);
  };

  const savedBy =
    result?.showRegimeCompare && result.newTotal !== null && result.oldTotal !== null
      ? result.oldTotal - result.newTotal
      : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="Income Tax Calculator" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={88}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.fyNote, inter18('regular')]}>
            FY 2025-26 (AY 2026-27) · Rates per incometaxindia.gov.in
          </Text>

          <View style={styles.card}>
            <Text style={[styles.sectionTitle, inter18('medium')]}>Type of taxpayer</Text>
            <View style={styles.payerGrid}>
              {TAXPAYER_OPTIONS.map(opt => {
                const selected = taxpayerType === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => handleTaxpayerChange(opt.id)}
                    style={[styles.payerChip, selected && styles.payerChipActive]}>
                    <Text
                      style={[
                        styles.payerChipText,
                        inter18(selected ? 'semiBold' : 'regular'),
                        selected && styles.payerChipTextActive,
                      ]}
                      numberOfLines={2}>
                      {opt.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {usesRegime ? (
            <View style={styles.card}>
              <View style={styles.fieldHeader}>
                <Text style={[styles.sectionTitle, inter18('medium')]}>Tax regime</Text>
                <RegimeToggle regime={regime} onChange={setRegime} />
              </View>
              {isIndividual ? (
                <>
                  <Text style={[styles.sectionTitle, inter18('medium')]}>Age category</Text>
                  <View style={styles.ageRow}>
                    {AGE_OPTIONS.map(opt => (
                      <Pressable
                        key={opt.idx}
                        onPress={() => setAgeIdx(opt.idx)}
                        style={[styles.ageChip, ageIdx === opt.idx && styles.ageChipActive]}>
                        <Text
                          style={[
                            styles.ageChipTitle,
                            inter18(ageIdx === opt.idx ? 'semiBold' : 'regular'),
                            ageIdx === opt.idx && styles.ageChipTitleActive,
                          ]}>
                          {opt.title}
                        </Text>
                        <Text
                          style={[
                            styles.ageChipSub,
                            inter18('regular'),
                            ageIdx === opt.idx && styles.ageChipTitleActive,
                          ]}>
                          {opt.range}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}
            </View>
          ) : null}

          {taxpayerType === 'domesticCompany' ? (
            <View style={styles.card}>
              <Text style={[styles.sectionTitle, inter18('medium')]}>Company tax rate</Text>
              {DOMESTIC_COMPANY_RATE_OPTIONS.map(opt => (
                <Pressable
                  key={opt.id}
                  onPress={() => setDomesticRate(opt.id)}
                  style={[
                    styles.rateOption,
                    domesticRate === opt.id && styles.rateOptionActive,
                  ]}>
                  <Text
                    style={[
                      styles.rateOptionLabel,
                      inter18(domesticRate === opt.id ? 'semiBold' : 'regular'),
                    ]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.rateOptionNote, inter18('regular')]}>{opt.note}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {taxpayerType === 'cooperative' ? (
            <View style={styles.card}>
              <Pressable
                onPress={() => setCoopOpt115BAD(v => !v)}
                style={styles.checkRow}>
                <View style={[styles.checkbox, coopOpt115BAD && styles.checkboxOn]}>
                  {coopOpt115BAD ? (
                    <Text style={styles.checkMark}>✓</Text>
                  ) : null}
                </View>
                <View style={styles.checkTextWrap}>
                  <Text style={[styles.checkLabel, inter18('medium')]}>
                    Opt for Section 115BAD (22% flat)
                  </Text>
                  <Text style={[styles.checkHint, inter18('regular')]}>
                    Otherwise default co-operative slab rates apply
                  </Text>
                </View>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={[styles.sectionTitle, inter18('medium')]}>
              {usesSimpleIncome ? 'Total taxable income' : 'Income details'}
            </Text>

            {usesSimpleIncome ? (
              <TaxInputField
                label="Total income (₹)"
                placeholder="e.g. 5000000"
                value={totalIncome}
                onChangeText={numField(setTotalIncome)}
              />
            ) : (
              <>
                {isIndividual ? (
                  <>
                    <TaxInputField
                      label="Gross annual salary (₹)"
                      placeholder="e.g. 1200000"
                      value={salary}
                      onChangeText={numField(setSalary)}
                    />
                    <TaxInputField
                      label="Rental income (₹)"
                      value={rental}
                      onChangeText={numField(setRental)}
                    />
                    <TaxInputField
                      label="Other income (₹)"
                      value={other}
                      onChangeText={numField(setOther)}
                    />
                    <TaxInputField
                      label="Interest income (₹)"
                      value={interest}
                      onChangeText={numField(setInterest)}
                    />
                  </>
                ) : (
                  <TaxInputField
                    label="Total income (₹)"
                    placeholder="Gross total income"
                    value={totalIncome}
                    onChangeText={numField(setTotalIncome)}
                  />
                )}

                {regime === 'old' && usesRegime ? (
                  <>
                    <View style={styles.divider} />
                    <Text style={[styles.dedTitle, inter18('medium')]}>
                      Deductions (old regime)
                    </Text>
                    <TaxInputField
                      label="Sec 80C (max ₹1.5L)"
                      value={sec80C}
                      onChangeText={cappedField(setSec80C, 150_000)}
                    />
                    <TaxInputField
                      label="Sec 80D – health insurance (₹)"
                      value={sec80D}
                      onChangeText={numField(setSec80D)}
                    />
                    <TaxInputField
                      label="HRA exemption (₹)"
                      value={hra}
                      onChangeText={numField(setHra)}
                    />
                    <TaxInputField
                      label="Home loan interest – Sec 24(b) (₹)"
                      value={homeLoan}
                      onChangeText={numField(setHomeLoan)}
                    />
                    <TaxInputField
                      label="Education loan – Sec 80E (₹)"
                      value={sec80E}
                      onChangeText={numField(setSec80E)}
                    />
                    <TaxInputField
                      label="NPS – Sec 80CCD(1B) (max ₹50K)"
                      value={nps}
                      onChangeText={cappedField(setNps, 50_000)}
                    />
                  </>
                ) : null}
              </>
            )}
          </View>

          <Pressable
            disabled={!hasIncome}
            onPress={handleCalculate}
            style={({ pressed }) => [
              styles.calcBtn,
              !hasIncome && styles.calcBtnDisabled,
              pressed && hasIncome && styles.calcBtnPressed,
            ]}>
            <Text style={[styles.calcBtnText, inter18('semiBold')]}>Calculate tax</Text>
          </Pressable>

          {result ? (
            <>
              <View style={styles.summary}>
                <Text style={[styles.resultHeading, inter18('bold')]}>
                  {result.taxpayerLabel}
                </Text>
                {usesRegime ? (
                  <Text style={[styles.resultSub, inter18('regular')]}>
                    {regime === 'new' ? 'New' : 'Old'} regime · FY 2025-26
                  </Text>
                ) : null}
                {result.rateNote ? (
                  <Text style={[styles.resultSub, inter18('regular')]}>{result.rateNote}</Text>
                ) : null}

                <SummaryLine emphasis label="Total tax payable" value={fmtInr(result.total)} />

                {result.total === 0 ? (
                  <Text style={[styles.zeroNote, inter18('medium')]}>
                    {result.rebate87A > 0
                      ? 'Section 87A rebate applied – zero tax'
                      : 'Income below taxable limit'}
                  </Text>
                ) : null}

                <View style={styles.divider} />
                <SummaryLine label="Gross total income" value={fmtInr(result.gross)} />
                {result.stdDed > 0 ? (
                  <SummaryLine
                    label="Standard deduction"
                    value={`– ${fmtInr(result.stdDed)}`}
                    valueColor="#A32D2D"
                  />
                ) : null}
                {result.otherDed > 0 ? (
                  <SummaryLine
                    label="Other deductions"
                    value={`– ${fmtInr(result.otherDed)}`}
                    valueColor="#A32D2D"
                  />
                ) : null}
                <SummaryLine label="Taxable income" value={fmtInr(result.taxable)} />
                <SummaryLine label="Tax before cess" value={fmtInr(result.taxBeforeCess)} />
                {result.rebate87A > 0 ? (
                  <SummaryLine
                    label="Section 87A rebate"
                    value={`– ${fmtInr(result.rebate87A)}`}
                    valueColor="#A32D2D"
                  />
                ) : null}
                <SummaryLine label="Surcharge" value={fmtInr(result.surcharge)} />
                <SummaryLine label="Health & education cess (4%)" value={fmtInr(result.cess)} />
                <SummaryLine
                  label="Effective tax rate"
                  value={`${result.effRate.toFixed(2)}%`}
                  valueColor={ACCENT}
                />
                {result.takeHomeMonthly !== null ? (
                  <SummaryLine
                    label="Take-home monthly"
                    value={fmtInr(result.takeHomeMonthly)}
                    valueColor={ACCENT}
                  />
                ) : null}
              </View>

              {result.slabDetails.length > 0 ? (
                <View style={styles.card}>
                  <Text style={[styles.sectionTitle, inter18('medium')]}>Slab-wise tax</Text>
                  <IncomeTaxSlabBars slabs={result.slabDetails} />
                </View>
              ) : null}

              {result.showRegimeCompare &&
              result.newTotal !== null &&
              result.oldTotal !== null &&
              savedBy !== null ? (
                <View style={styles.card}>
                  <Text style={[styles.sectionTitle, inter18('medium')]}>
                    New vs old regime
                  </Text>
                  <View style={styles.compareRow}>
                    <View
                      style={[
                        styles.compareBox,
                        savedBy >= 0 && styles.compareBoxHighlight,
                      ]}>
                      <Text style={[styles.compareLbl, inter18('regular')]}>New regime</Text>
                      <Text style={[styles.compareVal, inter18('semiBold')]}>
                        {fmtInr(result.newTotal)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.compareBox,
                        savedBy < 0 && styles.compareBoxHighlight,
                      ]}>
                      <Text style={[styles.compareLbl, inter18('regular')]}>Old regime</Text>
                      <Text style={[styles.compareVal, inter18('semiBold')]}>
                        {fmtInr(result.oldTotal)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.compareHint, inter18('medium')]}>
                    {savedBy >= 0
                      ? `New regime saves ${fmtInr(Math.abs(savedBy))} vs old`
                      : `Old regime saves ${fmtInr(Math.abs(savedBy))} vs new`}
                  </Text>
                </View>
              ) : null}
            </>
          ) : null}

          <Text style={[styles.disclaimer, inter18('regular')]}>
            Estimates only. Consult a chartered accountant for filing. MAT, special rates, and
            marginal relief are not included.
          </Text>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  fyNote: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#3F3F46',
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  payerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  payerChip: {
    width: '48%',
    flexGrow: 1,
    minWidth: '46%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#FAFAFA',
    minHeight: 44,
    justifyContent: 'center',
  },
  payerChipActive: {
    borderColor: ACCENT,
    backgroundColor: '#E1F5EE',
  },
  payerChipText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  payerChipTextActive: {
    color: ACCENT,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
    gap: 3,
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
    color: ACCENT,
  },
  ageRow: {
    flexDirection: 'row',
    gap: 6,
  },
  ageChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  ageChipActive: {
    borderColor: ACCENT,
    backgroundColor: '#E1F5EE',
  },
  ageChipTitle: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  ageChipTitleActive: {
    color: ACCENT,
  },
  ageChipSub: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
    textAlign: 'center',
  },
  rateOption: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FAFAFA',
  },
  rateOptionActive: {
    borderColor: ACCENT,
    backgroundColor: '#E1F5EE',
  },
  rateOptionLabel: {
    fontSize: 14,
    color: '#111111',
  },
  rateOptionNote: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 15,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxOn: {
    borderColor: ACCENT,
    backgroundColor: ACCENT,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  checkTextWrap: {
    flex: 1,
  },
  checkLabel: {
    fontSize: 13,
    color: '#111111',
  },
  checkHint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 15,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#3F3F46',
  },
  dedTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
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
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  calcBtn: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  calcBtnDisabled: {
    opacity: 0.45,
  },
  calcBtnPressed: {
    opacity: 0.88,
  },
  calcBtnText: {
    fontSize: 15,
    color: '#FFFFFF',
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
  resultHeading: {
    fontSize: 16,
    color: '#111111',
    marginBottom: 2,
  },
  resultSub: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 15,
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
    color: ACCENT,
  },
  zeroNote: {
    fontSize: 12,
    color: ACCENT,
    marginTop: 4,
    marginBottom: 4,
  },
  compareRow: {
    flexDirection: 'row',
    gap: 8,
  },
  compareBox: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  compareBoxHighlight: {
    borderColor: ACCENT,
    borderWidth: 1.5,
    backgroundColor: '#E1F5EE',
  },
  compareLbl: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  compareVal: {
    fontSize: 14,
    color: '#111111',
  },
  compareHint: {
    fontSize: 12,
    color: '#15803D',
    marginTop: 8,
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
  },
});

export default IncomeTaxCalculatorScreen;

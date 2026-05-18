import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { EnquiryFormData } from '../navigation/HealthInsuranceStack';

const COVER_OPTIONS = [
  '₹50 Thousand',
  '₹75 Thousand',
  '₹5 Lakh',
  '₹7 Lakh',
  '₹10 Lakh',
  '₹15 Lakh',
  '₹20 Lakh',
  '₹25 Lakh',
  '₹30 Lakh',
  '₹35 Lakh',
  '₹40 Lakh',
  '₹45 Lakh',
  '₹50 Lakh',
  '₹75 Lakh',
  '₹1 Crore',
  '₹2 Crores',
  '₹3 Crores',
  '₹4 Crores',
  '₹5 Crores',
];

type Props = {
  onBack: () => void;
  onSubmit: (data: EnquiryFormData) => void;
};

function BackIcon() {
  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Path
        d="M15 18L9 12L15 6"
        fill="none"
        stroke="#1A5C35"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
    </Svg>
  );
}

function CheckIcon({ color = '#FFFFFF' }: { color?: string }) {
  return (
    <Svg height={14} viewBox="0 0 24 24" width={14}>
      <Path
        d="M20 6L9 17l-5-5"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </Svg>
  );
}

/* ─── Step indicator ─────────────────────────────────────── */

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { num: 1 as const, label: 'Members' },
    { num: 2 as const, label: 'Ages' },
    { num: 3 as const, label: 'Details' },
  ];
  return (
    <View style={styles.stepRow}>
      {steps.map((s, i) => {
        const done = s.num < current;
        const active = s.num === current;
        return (
          <React.Fragment key={s.num}>
            {i > 0 && (
              <View style={[styles.stepLine, done && styles.stepLineDone]} />
            )}
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  active && styles.stepCircleActive,
                  done && styles.stepCircleDone,
                ]}>
                {done ? (
                  <CheckIcon color="#FFFFFF" />
                ) : (
                  <Text style={[styles.stepNum, active && styles.stepNumActive]}>
                    {s.num}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
                {s.label}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

/* ─── Member toggle card ─────────────────────────────────── */

function MemberCard({
  label,
  sub,
  selected,
  onToggle,
}: {
  label: string;
  sub: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.memberCard, selected && styles.memberCardActive]}>
      <View style={[styles.memberCheck, selected && styles.memberCheckActive]}>
        {selected && <CheckIcon color="#FFFFFF" />}
      </View>
      <View style={styles.memberInfo}>
        <Text style={[styles.memberLabel, selected && styles.memberLabelActive]}>
          {label}
        </Text>
        <Text style={styles.memberSub}>{sub}</Text>
      </View>
    </Pressable>
  );
}

/* ─── Children counter ───────────────────────────────────── */

function ChildCounter({
  count,
  onChange,
}: {
  count: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.counterRow}>
      <Pressable
        onPress={() => count > 0 && onChange(count - 1)}
        style={[styles.counterBtn, count === 0 && styles.counterBtnDisabled]}
        hitSlop={8}>
        <Text
          style={[
            styles.counterBtnText,
            count === 0 && styles.counterBtnTextDisabled,
          ]}>
          −
        </Text>
      </Pressable>
      <Text style={styles.counterVal}>{count}</Text>
      <Pressable
        onPress={() => count < 4 && onChange(count + 1)}
        style={[styles.counterBtn, count === 4 && styles.counterBtnDisabled]}
        hitSlop={8}>
        <Text
          style={[
            styles.counterBtnText,
            count === 4 && styles.counterBtnTextDisabled,
          ]}>
          +
        </Text>
      </Pressable>
    </View>
  );
}

/* ─── Cover amount dropdown ──────────────────────────────── */

function ChevronIcon() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Path
        d="M6 9l6 6 6-6"
        fill="none"
        stroke="#6B7280"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </Svg>
  );
}

function CoverDropdown({
  selected,
  onSelect,
  hasError,
}: {
  selected: string;
  onSelect: (v: string) => void;
  hasError: boolean;
}) {
  const [open, setOpen] = useState(false);

  function choose(v: string) {
    onSelect(v);
    setOpen(false);
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.dropdownTrigger, hasError && styles.inputError]}>
        <Text style={selected ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {selected || 'Select cover amount'}
        </Text>
        <ChevronIcon />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Cover Amount</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                <Svg height={20} viewBox="0 0 24 24" width={20}>
                  <Path
                    d="M18 6L6 18M6 6l12 12"
                    fill="none"
                    stroke="#6B7280"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </Svg>
              </Pressable>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              style={styles.modalList}>
              {COVER_OPTIONS.map((opt, i) => {
                const isSelected = selected === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => choose(opt)}
                    style={[
                      styles.optionRow,
                      i < COVER_OPTIONS.length - 1 && styles.optionRowBorder,
                      isSelected && styles.optionRowActive,
                    ]}>
                    <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                      {opt}
                    </Text>
                    {isSelected && <CheckIcon color="#6B21A8" />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/* ─── Screen ─────────────────────────────────────────────── */

function EnquiryScreen({ onBack, onSubmit }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [includeSelf, setIncludeSelf] = useState(true);
  const [includeSpouse, setIncludeSpouse] = useState(false);
  const [childrenCount, setChildrenCount] = useState(0);

  // Step 2
  const [selfAge, setSelfAge] = useState('');
  const [spouseAge, setSpouseAge] = useState('');
  const [childrenAges, setChildrenAges] = useState<string[]>([]);

  // Step 3
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [coverAmount, setCoverAmount] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setChildrenAges(prev => {
      const next = [...prev];
      while (next.length < childrenCount) next.push('');
      return next.slice(0, childrenCount);
    });
  }, [childrenCount]);

  function clearError(key: string) {
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  }

  function validateStep1() {
    if (!includeSelf && !includeSpouse && childrenCount === 0) {
      setErrors({ members: 'Please select at least one member' });
      return false;
    }
    setErrors({});
    return true;
  }

  function validateStep2() {
    const e: Record<string, string> = {};
    if (includeSelf && (!selfAge.trim() || isNaN(Number(selfAge)) || Number(selfAge) < 1)) {
      e.selfAge = 'Enter a valid age';
    }
    if (includeSpouse && (!spouseAge.trim() || isNaN(Number(spouseAge)) || Number(spouseAge) < 1)) {
      e.spouseAge = 'Enter a valid age';
    }
    childrenAges.forEach((age, i) => {
      if (!age.trim() || isNaN(Number(age)) || Number(age) < 1) {
        e[`child_${i}`] = 'Enter a valid age';
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep3() {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    if (!/^\d{10}$/.test(mobile)) e.mobile = 'Enter a valid 10-digit number';
    if (!city.trim()) e.city = 'City is required';
    if (!/^\d{6}$/.test(pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    if (!coverAmount) e.coverAmount = 'Select a cover amount';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) {
      onSubmit({
        includeSelf,
        includeSpouse,
        childrenCount,
        selfAge,
        spouseAge,
        childrenAges,
        firstName,
        lastName,
        mobile,
        city,
        pincode,
        coverAmount,
      });
    }
  }

  function handleBack() {
    if (step === 1) onBack();
    else setStep(prev => (prev - 1) as 1 | 2 | 3);
  }

  const STEP_TITLES = ['Who to insure?', 'Member ages', 'Basic details'];
  const STEP_SUBS = [
    'Select the members you want to cover.',
    'Enter the age of each member.',
    'Tell us a bit about yourself.',
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={10}>
            <BackIcon />
          </Pressable>
          <Text style={styles.headerTitle}>Health Enquiry</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <StepIndicator current={step} />

          <Text style={styles.formHeading}>{STEP_TITLES[step - 1]}</Text>
          <Text style={styles.formSub}>{STEP_SUBS[step - 1]}</Text>

          {/* ── Step 1: Select members ── */}
          {step === 1 && (
            <View>
              <MemberCard
                label="Self"
                sub="Primary insured member"
                selected={includeSelf}
                onToggle={() => {
                  setIncludeSelf(v => !v);
                  clearError('members');
                }}
              />
              <MemberCard
                label="Spouse"
                sub="Husband / Wife"
                selected={includeSpouse}
                onToggle={() => {
                  setIncludeSpouse(v => !v);
                  clearError('members');
                }}
              />
              <View style={styles.childrenCard}>
                <View style={styles.childrenInfo}>
                  <Text style={styles.childrenLabel}>Children</Text>
                  <Text style={styles.childrenSub}>Add dependent children</Text>
                </View>
                <ChildCounter
                  count={childrenCount}
                  onChange={v => {
                    setChildrenCount(v);
                    clearError('members');
                  }}
                />
              </View>
              {!!errors.members && (
                <Text style={styles.errorText}>{errors.members}</Text>
              )}
            </View>
          )}

          {/* ── Step 2: Member ages ── */}
          {step === 2 && (
            <View>
              {includeSelf && (
                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>Self Age *</Text>
                  <TextInput
                    style={[styles.input, !!errors.selfAge && styles.inputError]}
                    placeholder="e.g. 30"
                    placeholderTextColor="#AAAAAA"
                    keyboardType="number-pad"
                    maxLength={3}
                    value={selfAge}
                    onChangeText={v => {
                      setSelfAge(v);
                      clearError('selfAge');
                    }}
                  />
                  {!!errors.selfAge && (
                    <Text style={styles.errorText}>{errors.selfAge}</Text>
                  )}
                </View>
              )}
              {includeSpouse && (
                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>Spouse Age *</Text>
                  <TextInput
                    style={[styles.input, !!errors.spouseAge && styles.inputError]}
                    placeholder="e.g. 28"
                    placeholderTextColor="#AAAAAA"
                    keyboardType="number-pad"
                    maxLength={3}
                    value={spouseAge}
                    onChangeText={v => {
                      setSpouseAge(v);
                      clearError('spouseAge');
                    }}
                  />
                  {!!errors.spouseAge && (
                    <Text style={styles.errorText}>{errors.spouseAge}</Text>
                  )}
                </View>
              )}
              {childrenAges.map((age, i) => (
                <View key={i} style={styles.fieldWrap}>
                  <Text style={styles.label}>Child {i + 1} Age *</Text>
                  <TextInput
                    style={[styles.input, !!errors[`child_${i}`] && styles.inputError]}
                    placeholder="e.g. 10"
                    placeholderTextColor="#AAAAAA"
                    keyboardType="number-pad"
                    maxLength={2}
                    value={age}
                    onChangeText={v => {
                      const next = [...childrenAges];
                      next[i] = v;
                      setChildrenAges(next);
                      clearError(`child_${i}`);
                    }}
                  />
                  {!!errors[`child_${i}`] && (
                    <Text style={styles.errorText}>{errors[`child_${i}`]}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* ── Step 3: Basic details ── */}
          {step === 3 && (
            <View>
              <View style={styles.row}>
                <View style={[styles.fieldWrap, styles.halfField]}>
                  <Text style={styles.label}>First Name *</Text>
                  <TextInput
                    style={[styles.input, !!errors.firstName && styles.inputError]}
                    placeholder="First name"
                    placeholderTextColor="#AAAAAA"
                    value={firstName}
                    onChangeText={v => {
                      setFirstName(v);
                      clearError('firstName');
                    }}
                  />
                  {!!errors.firstName && (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  )}
                </View>
                <View style={[styles.fieldWrap, styles.halfField]}>
                  <Text style={styles.label}>Last Name *</Text>
                  <TextInput
                    style={[styles.input, !!errors.lastName && styles.inputError]}
                    placeholder="Last name"
                    placeholderTextColor="#AAAAAA"
                    value={lastName}
                    onChangeText={v => {
                      setLastName(v);
                      clearError('lastName');
                    }}
                  />
                  {!!errors.lastName && (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  )}
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Mobile Number *</Text>
                <TextInput
                  style={[styles.input, !!errors.mobile && styles.inputError]}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#AAAAAA"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobile}
                  onChangeText={v => {
                    setMobile(v);
                    clearError('mobile');
                  }}
                />
                {!!errors.mobile && (
                  <Text style={styles.errorText}>{errors.mobile}</Text>
                )}
              </View>

              <View style={styles.row}>
                <View style={[styles.fieldWrap, styles.halfField]}>
                  <Text style={styles.label}>City *</Text>
                  <TextInput
                    style={[styles.input, !!errors.city && styles.inputError]}
                    placeholder="Your city"
                    placeholderTextColor="#AAAAAA"
                    value={city}
                    onChangeText={v => {
                      setCity(v);
                      clearError('city');
                    }}
                  />
                  {!!errors.city && (
                    <Text style={styles.errorText}>{errors.city}</Text>
                  )}
                </View>
                <View style={[styles.fieldWrap, styles.halfField]}>
                  <Text style={styles.label}>Pincode *</Text>
                  <TextInput
                    style={[styles.input, !!errors.pincode && styles.inputError]}
                    placeholder="6-digit pincode"
                    placeholderTextColor="#AAAAAA"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={pincode}
                    onChangeText={v => {
                      setPincode(v);
                      clearError('pincode');
                    }}
                  />
                  {!!errors.pincode && (
                    <Text style={styles.errorText}>{errors.pincode}</Text>
                  )}
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Cover Amount *</Text>
                <CoverDropdown
                  selected={coverAmount}
                  hasError={!!errors.coverAmount}
                  onSelect={(v: string) => {
                    setCoverAmount(v);
                    clearError('coverAmount');
                  }}
                />
                {!!errors.coverAmount && (
                  <Text style={styles.errorText}>{errors.coverAmount}</Text>
                )}
              </View>
            </View>
          )}

          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [styles.nextBtn, pressed && styles.pressed]}>
            <Text style={styles.nextBtnText}>
              {step === 3 ? 'View Quotes →' : 'Next →'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F4F4' },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#14532D',
  },
  headerSpacer: { width: 34 },

  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  /* Step indicator */
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  stepItem: { alignItems: 'center' },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 20,
    marginHorizontal: 4,
  },
  stepLineDone: { backgroundColor: '#22C55E' },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: '#6B21A8',
    borderColor: '#6B21A8',
  },
  stepCircleDone: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  stepNum: { fontSize: 13, fontWeight: '700', color: '#9CA3AF' },
  stepNumActive: { color: '#FFFFFF' },
  stepLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  stepLabelActive: { color: '#6B21A8', fontWeight: '700' },

  formHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 6,
  },
  formSub: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 19,
    marginBottom: 20,
  },

  /* Member cards */
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 10,
  },
  memberCardActive: {
    borderColor: '#6B21A8',
    backgroundColor: '#FAF5FF',
  },
  memberCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  memberCheckActive: {
    borderColor: '#6B21A8',
    backgroundColor: '#6B21A8',
  },
  memberInfo: { flex: 1 },
  memberLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 2,
  },
  memberLabelActive: { color: '#6B21A8' },
  memberSub: { fontSize: 12, color: '#888888' },

  /* Children counter card */
  childrenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 10,
  },
  childrenInfo: { flex: 1 },
  childrenLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 2,
  },
  childrenSub: { fontSize: 12, color: '#888888' },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#6B21A8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: { backgroundColor: '#E5E7EB' },
  counterBtnText: { fontSize: 20, color: '#FFFFFF', lineHeight: 24, fontWeight: '600' },
  counterBtnTextDisabled: { color: '#9CA3AF' },
  counterVal: {
    width: 32,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },

  /* Fields */
  fieldWrap: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#111111',
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { fontSize: 11, color: '#EF4444', marginTop: 4 },

  /* Row layout for side-by-side fields */
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },

  /* Cover dropdown */
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  dropdownValue: { fontSize: 14, color: '#111111', flex: 1 },
  dropdownPlaceholder: { fontSize: 14, color: '#AAAAAA', flex: 1 },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111111' },
  modalList: { paddingHorizontal: 20 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  optionRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  optionRowActive: { backgroundColor: 'transparent' },
  optionText: { fontSize: 15, color: '#374151' },
  optionTextActive: { color: '#6B21A8', fontWeight: '700' },

  /* Next / Submit button */
  nextBtn: {
    backgroundColor: '#6B21A8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  nextBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  pressed: { opacity: 0.82 },
});

export default EnquiryScreen;

import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import {
  fetchTravelPlanDetails,
  getTravelInsuranceErrorMessage,
  submitTravelProposal,
} from '../api/travelInsuranceApi';
import SecureEncryptedBanner, { SECURE_GREEN } from '../components/SecureEncryptedBanner';
import FormFieldLabel from '../components/FormFieldLabel';
import type {
  TravelInsurancePlanSummary,
  TravelInsuranceSession,
  VerifyFormData,
} from '../types/travelInsurance.types';
import {
  apiDobToDisplay,
  buildProposalPayload,
  buildVerifyFormFromSession,
  formatIsoDateDisplay,
  genderLabel,
  getDisplayName,
  getInitials,
  isValidIndianMobile,
} from '../utils/travelInsuranceHelpers';
import { inter18 } from '../../../core/theme/typography';

type Props = {
  session: TravelInsuranceSession;
  onBack: () => void;
  onComplete: (summary: TravelInsurancePlanSummary) => void;
};

const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'];
const TITLE_OPTIONS = ['MR', 'MRS', 'MS'];
const GENDER_OPTIONS = ['Male', 'Female'];
const STATE_OPTIONS = [
  'Maharashtra',
  'Karnataka',
  'Delhi',
  'Gujarat',
  'Tamil Nadu',
  'Telangana',
  'West Bengal',
  'Rajasthan',
  'Uttar Pradesh',
  'Kerala',
];

function BackIcon() {
  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Path
        d="M15 18L9 12L15 6"
        fill="none"
        stroke="#111111"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </Svg>
  );
}

function CheckCircleIcon() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Circle cx="12" cy="12" fill="#DCFCE7" r="10" />
      <Path
        d="M8 12.5l2.5 2.5L16 9.5"
        fill="none"
        stroke="#16A34A"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </Svg>
  );
}

function LockBadge() {
  return (
    <View style={styles.lockBadge}>
      <Svg height={12} viewBox="0 0 24 24" width={12}>
        <Rect
          fill="none"
          height="9"
          rx="1.5"
          stroke="#2563EB"
          strokeWidth="1.6"
          width="12"
          x="6"
          y="10"
        />
        <Path
          d="M9 10V8a3 3 0 016 0v2"
          fill="none"
          stroke="#2563EB"
          strokeLinecap="round"
          strokeWidth="1.6"
        />
      </Svg>
      <Text style={[styles.lockBadgeText, inter18('medium')]}>Locked</Text>
    </View>
  );
}

function SelectModal({
  open,
  title,
  options,
  selected,
  onClose,
  onSelect,
}: {
  open: boolean;
  title: string;
  options: string[];
  selected: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <Modal animationType="slide" transparent visible={open} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={event => event.stopPropagation()}>
          <Text style={[styles.modalTitle, inter18('semiBold')]}>{title}</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            {options.map(option => (
              <Pressable
                key={option}
                onPress={() => onSelect(option)}
                style={[
                  styles.modalOption,
                  selected === option && styles.modalOptionActive,
                ]}>
                <Text
                  style={[
                    styles.modalOptionText,
                    inter18(selected === option ? 'semiBold' : 'regular'),
                  ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldBlock}>
      <FormFieldLabel label={label} />
      <View style={styles.lockedField}>
        <Text style={[styles.lockedValue, inter18('regular')]}>{value}</Text>
        <View style={styles.autoFilledBadge}>
          <Text style={[styles.autoFilledText, inter18('medium')]}>AUTO-FILLED</Text>
        </View>
      </View>
    </View>
  );
}

function EditableField({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  required = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  required?: boolean;
}) {
  return (
    <View style={styles.fieldBlock}>
      <FormFieldLabel label={label} required={required} />
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholderTextColor="#94A3B8"
        style={[styles.editableField, inter18('regular')]}
        value={value}
      />
    </View>
  );
}

function TravelInsuranceVerifyScreen({ session, onBack, onComplete }: Props) {
  const [form, setForm] = useState<VerifyFormData>(() => buildVerifyFormFromSession(session));
  const [submitting, setSubmitting] = useState(false);
  const [picker, setPicker] = useState<null | 'marital' | 'state'>(null);

  const displayName = useMemo(() => getDisplayName(form), [form]);
  const initials = useMemo(() => getInitials(displayName || 'Travel'), [displayName]);

  const updateField = <K extends keyof VerifyFormData>(key: K, value: VerifyFormData[K]) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const canSubmit =
    form.firstName.trim() &&
    form.lastName.trim() &&
    isValidIndianMobile(form.mobile) &&
    form.email.trim() &&
    form.nomineeName.trim() &&
    form.building.trim() &&
    form.streetName.trim() &&
    form.city.trim() &&
    form.pincode.trim().length === 6 &&
    form.state.trim() &&
    !submitting;

  const handleConfirm = async () => {
    if (!canSubmit) {
      Alert.alert('Incomplete details', 'Please fill all required fields before proceeding.');
      return;
    }

    setSubmitting(true);
    try {
      const proposalPayload = buildProposalPayload(session, form);
      const proposalResponse = await submitTravelProposal(proposalPayload);
      const policy = proposalResponse.proposalResponse?.pTrvPolDtls_inout;
      if (!policy?.travelplan) {
        throw new Error('Proposal did not return plan details.');
      }
      const planName = policy.travelplan;
      const planDetails = await fetchTravelPlanDetails(planName);
      const planMeta = planDetails.data.pTrvPlanDtlsList_out[0];

      onComplete({
        planName,
        areaName: planMeta?.areaname ?? policy.areaplan,
        finalPremium: policy.finalPremium,
        fromDate: policy.fromDate,
        toDate: policy.toDate,
        paymentUrl: policy.loading,
        covers: planDetails.data.pTrvCoverDtlsList_out ?? [],
      });
    } catch (error) {
      Alert.alert(
        'Unable to proceed',
        getTravelInsuranceErrorMessage(error, 'Proposal could not be processed.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={onBack} style={styles.headerIconBtn}>
          <BackIcon />
        </Pressable>
        <Text style={[styles.headerTitle, inter18('bold')]}>Travel Insurance</Text>
        <View style={styles.headerIconBtn} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.successBanner}>
            <CheckCircleIcon />
            <Text style={[styles.successText, inter18('medium')]}>
              Details fetched successfully. Please review and confirm.
            </Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={[styles.avatarText, inter18('bold')]}>{initials}</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={[styles.profileName, inter18('bold')]}>
                {displayName || 'Traveler'}
              </Text>
              <Text style={[styles.profileMeta, inter18('regular')]}>
                DOB: {apiDobToDisplay(form.dob)} · {genderLabel(form.gender)}
              </Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, inter18('bold')]}>Identity Details</Text>
              <LockBadge />
            </View>
            <LockedField label="Title" value={form.title} />
            <LockedField label="Gender" value={genderLabel(form.gender)} />
            <LockedField label="PAN Number" value={form.pan} />
            <LockedField label="Date of Birth" value={form.dob} />
          </View>

          <View style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, inter18('bold')]}>Contact & Personal Details</Text>
            <EditableField
              autoCapitalize="words"
              label="First Name"
              onChangeText={value => updateField('firstName', value)}
              required
              value={form.firstName}
            />
            <EditableField
              autoCapitalize="words"
              label="Middle Name"
              onChangeText={value => updateField('middleName', value)}
              value={form.middleName}
            />
            <EditableField
              autoCapitalize="words"
              label="Last Name"
              onChangeText={value => updateField('lastName', value)}
              required
              value={form.lastName}
            />
            <EditableField
              keyboardType="number-pad"
              label="Mobile Number"
              onChangeText={value => updateField('mobile', value.replace(/\D/g, '').slice(0, 10))}
              required
              value={form.mobile}
            />
            {form.mobile && !isValidIndianMobile(form.mobile) ? (
              <Text style={[styles.mobileError, inter18('medium')]}>
                Mobile number must be 10 digits and start with 6, 7, 8, or 9.
              </Text>
            ) : null}
            <EditableField
              autoCapitalize="none"
              keyboardType="email-address"
              label="Email Address"
              onChangeText={value => updateField('email', value)}
              required
              value={form.email}
            />
            <View style={styles.fieldBlock}>
              <FormFieldLabel label="Marital Status" required />
              <Pressable onPress={() => setPicker('marital')} style={styles.selectField}>
                <Text style={[styles.selectValue, inter18('regular')]}>
                  {form.maritalStatus.charAt(0) + form.maritalStatus.slice(1).toLowerCase()}
                </Text>
              </Pressable>
            </View>
            <EditableField
              autoCapitalize="words"
              label="Nominee Name"
              onChangeText={value => updateField('nomineeName', value)}
              required
              value={form.nomineeName}
            />
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, inter18('bold')]}>Policy Period</Text>
              <LockBadge />
            </View>
            <LockedField label="From" value={formatIsoDateDisplay(form.fromDate)} />
            <LockedField label="To" value={formatIsoDateDisplay(form.toDate)} />
          </View>

          <View style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, inter18('bold')]}>Address</Text>
            <EditableField
              label="Building / Flat"
              onChangeText={value => updateField('building', value)}
              required
              value={form.building}
            />
            <EditableField
              label="Street Name"
              onChangeText={value => updateField('streetName', value)}
              required
              value={form.streetName}
            />
            <EditableField
              autoCapitalize="words"
              label="City"
              onChangeText={value => updateField('city', value)}
              required
              value={form.city}
            />
            <EditableField
              keyboardType="number-pad"
              label="Pincode"
              onChangeText={value => updateField('pincode', value.replace(/\D/g, '').slice(0, 6))}
              required
              value={form.pincode}
            />
            <View style={styles.fieldBlock}>
              <FormFieldLabel label="State" required />
              <Pressable onPress={() => setPicker('state')} style={styles.selectField}>
                <Text style={[styles.selectValue, inter18('regular')]}>
                  {form.state || 'Select state'}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.infoBanner}>
            <Svg height={16} viewBox="0 0 24 24" width={16}>
              <Circle cx="12" cy="12" fill="none" r="10" stroke={SECURE_GREEN.icon} strokeWidth="1.8" />
              <Path d="M12 8v5M12 16h.01" stroke={SECURE_GREEN.icon} strokeLinecap="round" strokeWidth="2" />
            </Svg>
            <Text style={[styles.infoText, inter18('regular')]}>
              Your details are securely fetched from the Central KYC Registry. Some fields are
              locked as per regulatory requirements.
            </Text>
          </View>

          <SecureEncryptedBanner />

          <Pressable
            disabled={!canSubmit}
            onPress={handleConfirm}
            style={({ pressed }) => [
              styles.confirmBtn,
              !canSubmit && styles.confirmBtnDisabled,
              pressed && canSubmit && styles.confirmBtnPressed,
            ]}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={[styles.confirmBtnText, inter18('bold')]}>Confirm & proceed</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <SelectModal
        open={picker === 'marital'}
        options={MARITAL_OPTIONS}
        selected={form.maritalStatus.charAt(0) + form.maritalStatus.slice(1).toLowerCase()}
        title="Marital Status"
        onClose={() => setPicker(null)}
        onSelect={value => {
          updateField('maritalStatus', value.toUpperCase());
          setPicker(null);
        }}
      />
      <SelectModal
        open={picker === 'state'}
        options={STATE_OPTIONS}
        selected={form.state}
        title="State"
        onClose={() => setPicker(null)}
        onSelect={value => {
          updateField('state', value);
          setPicker(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    color: '#111111',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 14,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECFDF3',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  successText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  profileCopy: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    color: '#111827',
    marginBottom: 4,
  },
  profileMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#111827',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lockBadgeText: {
    fontSize: 11,
    color: '#2563EB',
  },
  fieldBlock: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#374151',
  },
  mobileError: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: -4,
  },
  lockedField: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: 'relative',
  },
  lockedValue: {
    fontSize: 15,
    color: '#111827',
    paddingRight: 88,
  },
  autoFilledBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  autoFilledText: {
    fontSize: 9,
    color: '#1D4ED8',
    letterSpacing: 0.4,
  },
  editableField: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  selectField: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  selectValue: {
    fontSize: 15,
    color: '#111827',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: SECURE_GREEN.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SECURE_GREEN.border,
    padding: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: SECURE_GREEN.text,
    lineHeight: 18,
  },
  confirmBtn: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  confirmBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  confirmBtnPressed: {
    opacity: 0.92,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '60%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 10,
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionActive: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  modalOptionText: {
    fontSize: 15,
    color: '#111827',
  },
});

export default TravelInsuranceVerifyScreen;

import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
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
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

import {
  getTravelInsuranceErrorMessage,
  submitTravelCkyc,
} from '../api/travelInsuranceApi';
import type { TravelInsuranceSession } from '../types/travelInsurance.types';
import CalendarPickerModal from '../components/CalendarPickerModal';
import FormFieldLabel from '../components/FormFieldLabel';
import SecureEncryptedBanner from '../components/SecureEncryptedBanner';
import {
  buildSessionFromCkyc,
  dateToDobString,
  ddMmYyyyToApiDob,
  dobStringToDate,
  formatIsoDateDisplay,
  formatUserPhoneForApi,
  getDefaultTripDates,
  getMaxDobDate,
  getMaxTripEndDate,
  getMinTripStartDate,
  isValidIndianMobile,
  isValidTripDateRange,
  isoToDate,
  parseDobInput,
  toIsoDate,
} from '../utils/travelInsuranceHelpers';

const TravelHeroImage = require('../../../assets/images/travel-insurace.png');

const SCREEN = Dimensions.get('window');
const HERO_WIDTH = SCREEN.width;
const HERO_HEIGHT = Math.round(SCREEN.height * 0.35);
const PAGE_BACKGROUND = '#f8f9ff';

type Props = {
  onBack: () => void;
  onHelpPress?: () => void;
  onVerified: (session: TravelInsuranceSession) => void;
};

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const DOB_REGEX = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

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

function HelpIcon() {
  return (
    <Svg height={22} viewBox="0 0 24 24" width={22}>
      <Circle cx="12" cy="12" fill="none" r="10" stroke="#111111" strokeWidth="1.8" />
      <Path
        d="M9.5 9.25a2.75 2.75 0 015.1 1.35c0 1.65-2.1 2.1-2.1 3.65"
        fill="none"
        stroke="#111111"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <Circle cx="12" cy="17.25" fill="#111111" r="1.1" />
    </Svg>
  );
}

function IdCardIcon() {
  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Rect
        fill="none"
        height="14"
        rx="2"
        stroke="#94A3B8"
        strokeWidth="1.6"
        width="18"
        x="3"
        y="5"
      />
      <Circle cx="9" cy="11" fill="none" r="2" stroke="#94A3B8" strokeWidth="1.4" />
      <Path d="M6 16c.8-1.6 2-2.4 3-2.4s2.2.8 3 2.4" fill="none" stroke="#94A3B8" strokeWidth="1.4" />
      <Path d="M14 9h5M14 12h5M14 15h3" stroke="#94A3B8" strokeLinecap="round" strokeWidth="1.4" />
    </Svg>
  );
}

function CalendarIcon() {
  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Rect
        fill="none"
        height="15"
        rx="2"
        stroke="#94A3B8"
        strokeWidth="1.6"
        width="18"
        x="3"
        y="5"
      />
      <Path d="M3 9h18M8 3v4M16 3v4" stroke="#94A3B8" strokeLinecap="round" strokeWidth="1.6" />
    </Svg>
  );
}

function ShieldOutlineIcon() {
  return (
    <Svg height={22} viewBox="0 0 24 24" width={22}>
      <Path
        d="M12 3l7 3v6c0 4.5-3.2 7.4-7 9-3.8-1.6-7-4.5-7-9V6l7-3z"
        fill="none"
        stroke="#60A5FA"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </Svg>
  );
}

function ShieldCheckIcon() {
  return (
    <Svg height={22} viewBox="0 0 24 24" width={22}>
      <Path
        d="M12 3l7 3v6c0 4.5-3.2 7.4-7 9-3.8-1.6-7-4.5-7-9V6l7-3z"
        fill="none"
        stroke="#60A5FA"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <Path
        d="M9.5 12l1.8 1.8L15 10"
        fill="none"
        stroke="#60A5FA"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </Svg>
  );
}

function ChevronRightIcon() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </Svg>
  );
}

function formatPanInput(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
}

function getAge(date: Date): number {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }
  return age;
}

function TravelInsuranceKycScreen({ onBack, onHelpPress, onVerified }: Props) {
  const defaultTripDates = useMemo(() => getDefaultTripDates(), []);
  const [pan, setPan] = useState('');
  const [dob, setDob] = useState('');
  const [mobile, setMobile] = useState('');
  const [fromDate, setFromDate] = useState(defaultTripDates.fromDate);
  const [toDate, setToDate] = useState(defaultTripDates.toDate);
  const [datePicker, setDatePicker] = useState<null | 'from' | 'to' | 'dob'>(null);
  const [submitting, setSubmitting] = useState(false);

  const calendarConfig = useMemo(() => {
    if (datePicker === 'dob') {
      return {
        title: 'Select date of birth',
        value: dobStringToDate(dob) ?? getMaxDobDate(),
        minimumDate: new Date(new Date().getFullYear() - 100, 0, 1),
        maximumDate: getMaxDobDate(),
      };
    }
    if (datePicker === 'from') {
      return {
        title: 'Select departure date',
        value: isoToDate(fromDate) ?? getMinTripStartDate(),
        minimumDate: getMinTripStartDate(),
        maximumDate: getMaxTripEndDate(),
      };
    }
    if (datePicker === 'to') {
      const minBase = isoToDate(fromDate) ?? getMinTripStartDate();
      const minimumDate = new Date(minBase);
      minimumDate.setDate(minimumDate.getDate() + 1);
      return {
        title: 'Select return date',
        value: isoToDate(toDate) ?? minimumDate,
        minimumDate,
        maximumDate: getMaxTripEndDate(),
      };
    }
    return null;
  }, [datePicker, dob, fromDate, toDate]);

  const handleCalendarSelect = (date: Date) => {
    if (datePicker === 'dob') {
      setDob(dateToDobString(date));
    } else if (datePicker === 'from') {
      const iso = toIsoDate(date);
      setFromDate(iso);
      if (!isValidTripDateRange(iso, toDate)) {
        const next = new Date(date);
        next.setDate(next.getDate() + 1);
        setToDate(toIsoDate(next));
      }
    } else if (datePicker === 'to') {
      setToDate(toIsoDate(date));
    }
    setDatePicker(null);
  };

  const panError = useMemo(() => {
    if (!pan) {
      return '';
    }
    return PAN_REGEX.test(pan) ? '' : 'Enter a valid 10-character PAN.';
  }, [pan]);

  const dobError = useMemo(() => {
    if (!dob) {
      return '';
    }
    const parsed = parseDobInput(dob);
    if (!parsed) {
      return 'Use dd-mm-yyyy format.';
    }
    if (getAge(parsed) < 18) {
      return 'Traveler must be at least 18 years old.';
    }
    return '';
  }, [dob]);

  const mobileError = useMemo(() => {
    if (!mobile) {
      return '';
    }
    return isValidIndianMobile(mobile)
      ? ''
      : 'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
  }, [mobile]);

  const tripDateError = useMemo(() => {
    if (!fromDate || !toDate) {
      return '';
    }
    return isValidTripDateRange(fromDate, toDate)
      ? ''
      : 'Return date must be after departure date.';
  }, [fromDate, toDate]);

  const isFormValid =
    PAN_REGEX.test(pan) &&
    !dobError &&
    DOB_REGEX.test(dob) &&
    isValidIndianMobile(mobile) &&
    isValidTripDateRange(fromDate, toDate);

  const handleVerify = async () => {
    if (!isFormValid) {
      Alert.alert('Incomplete details', 'Please fill all fields correctly before proceeding.');
      return;
    }

    const dobApi = ddMmYyyyToApiDob(dob);

    setSubmitting(true);
    try {
      const response = await submitTravelCkyc({
        docNumber: pan,
        dob: dobApi,
        userPhone: formatUserPhoneForApi(mobile),
        fromDate,
        toDate,
      });

      onVerified(
        buildSessionFromCkyc(response, pan, dobApi, mobile, fromDate, toDate),
      );
    } catch (error) {
      Alert.alert(
        'Verification failed',
        getTravelInsuranceErrorMessage(error, 'Unable to verify your details right now.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable hitSlop={10} onPress={onBack} style={styles.headerIconBtn}>
              <BackIcon />
            </Pressable>
            <Text style={[styles.headerTitle, inter18('bold')]}>Travel Insurance</Text>
            <Pressable
              hitSlop={10}
              onPress={onHelpPress}
              style={styles.headerIconBtn}>
              <HelpIcon />
            </Pressable>
          </View>

          <View style={styles.hero}>
            <Image
              resizeMode="cover"
              source={TravelHeroImage}
              style={styles.heroImage}
            />
            <Svg height={HERO_HEIGHT} pointerEvents="none" style={styles.heroGradient} width={HERO_WIDTH}>
              <Defs>
                <LinearGradient id="heroFade" x1="0" x2="0" y1="1" y2="0">
                  <Stop offset="0%" stopColor={PAGE_BACKGROUND} stopOpacity="1" />
                  <Stop offset="50%" stopColor={PAGE_BACKGROUND} stopOpacity="0.2" />
                  <Stop offset="100%" stopColor={PAGE_BACKGROUND} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect fill="url(#heroFade)" height={HERO_HEIGHT} width={HERO_WIDTH} x="0" y="0" />
            </Svg>
            <View style={styles.heroContent}>
              <Text style={[styles.heroTitle, inter18('bold')]}>Verify Your Details</Text>
              <Text style={[styles.heroSub, inter18('regular')]}>
                Secure identity verification for instant policy issuance.
              </Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <FormFieldLabel label="PAN Card Number" required style={styles.kycFieldLabel} variant="semiBold" />
            <View style={styles.inputWrap}>
              <TextInput
                autoCapitalize="characters"
                autoCorrect={false}
                keyboardType="default"
                maxLength={10}
                onChangeText={text => setPan(formatPanInput(text))}
                placeholder="e.g. ABCDE1234F"
                placeholderTextColor="#94A3B8"
                style={[styles.input, inter18('regular')]}
                value={pan}
              />
              <IdCardIcon />
            </View>
            <Text style={[styles.helperText, inter18('regular')]}>
              Auto-formats to uppercase. Must be 10 characters.
            </Text>
            {panError ? (
              <Text style={[styles.errorText, inter18('medium')]}>{panError}</Text>
            ) : null}

            <FormFieldLabel
              label="Date of Birth"
              required
              style={[styles.kycFieldLabel, styles.fieldGap]}
              variant="semiBold"
            />
            <Pressable onPress={() => setDatePicker('dob')} style={styles.inputWrap}>
              <Text
                style={[
                  styles.dateFieldText,
                  inter18('regular'),
                  !dob && styles.dateFieldPlaceholder,
                ]}>
                {dob || 'dd-mm-yyyy'}
              </Text>
              <CalendarIcon />
            </Pressable>
            <Text style={[styles.helperText, inter18('regular')]}>
              Traveler must be at least 18 years old.
            </Text>
            {dobError ? (
              <Text style={[styles.errorText, inter18('medium')]}>{dobError}</Text>
            ) : null}

            <FormFieldLabel
              label="Mobile Number"
              required
              style={[styles.kycFieldLabel, styles.fieldGap]}
              variant="semiBold"
            />
            <View style={styles.mobileRow}>
              <View style={styles.countryCodeBox}>
                <Text style={[styles.countryCodeText, inter18('semiBold')]}>+91</Text>
              </View>
              <TextInput
                keyboardType="number-pad"
                maxLength={10}
                onChangeText={text => setMobile(text.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit number"
                placeholderTextColor="#94A3B8"
                style={[styles.mobileInput, inter18('regular')]}
                value={mobile}
              />
            </View>
            {mobileError ? (
              <Text style={[styles.errorText, inter18('medium')]}>{mobileError}</Text>
            ) : null}

            <FormFieldLabel
              label="Travel Dates"
              required
              style={[styles.kycFieldLabel, styles.fieldGap]}
              variant="semiBold"
            />
            <View style={styles.tripDateRow}>
              <View style={styles.tripDateField}>
                <FormFieldLabel label="From" required style={styles.tripDateSubLabel} />
                <Pressable onPress={() => setDatePicker('from')} style={styles.tripDateInput}>
                  <Text style={[styles.tripDateValue, inter18('regular')]}>
                    {formatIsoDateDisplay(fromDate)}
                  </Text>
                  <CalendarIcon />
                </Pressable>
              </View>
              <View style={styles.tripDateField}>
                <FormFieldLabel label="To" required style={styles.tripDateSubLabel} />
                <Pressable onPress={() => setDatePicker('to')} style={styles.tripDateInput}>
                  <Text style={[styles.tripDateValue, inter18('regular')]}>
                    {formatIsoDateDisplay(toDate)}
                  </Text>
                  <CalendarIcon />
                </Pressable>
              </View>
            </View>
            <Text style={[styles.helperText, inter18('regular')]}>
              Select your trip start and return dates.
            </Text>
            {tripDateError ? (
              <Text style={[styles.errorText, inter18('medium')]}>{tripDateError}</Text>
            ) : null}

            <SecureEncryptedBanner />

            <Pressable
              disabled={!isFormValid || submitting}
              onPress={handleVerify}
              style={({ pressed }) => [
                styles.verifyBtn,
                (!isFormValid || submitting) && styles.verifyBtnDisabled,
                pressed && isFormValid && !submitting && styles.verifyBtnPressed,
              ]}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={[styles.verifyBtnText, inter18('bold')]}>Verify & Proceed</Text>
                  <ChevronRightIcon />
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.trustSection}>
            <View style={styles.trustRow}>
              <ShieldOutlineIcon />
              <View style={styles.trustCopy}>
                <Text style={[styles.trustTitle, inter18('bold')]}>Privacy First</Text>
                <Text style={[styles.trustDesc, inter18('regular')]}>
                  Your PAN is used only for identity verification and never shared.
                </Text>
              </View>
            </View>
            <View style={styles.trustRow}>
              <ShieldCheckIcon />
              <View style={styles.trustCopy}>
                <Text style={[styles.trustTitle, inter18('bold')]}>IRDAI Compliant</Text>
                <Text style={[styles.trustDesc, inter18('regular')]}>
                  Adhering to latest regulatory KYC norms for instant policy issuance.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {calendarConfig ? (
        <CalendarPickerModal
          maximumDate={calendarConfig.maximumDate}
          minimumDate={calendarConfig.minimumDate}
          title={calendarConfig.title}
          value={calendarConfig.value}
          visible={datePicker !== null}
          onClose={() => setDatePicker(null)}
          onSelect={handleCalendarSelect}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PAGE_BACKGROUND,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    backgroundColor: PAGE_BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(248, 249, 255, 0.92)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.35)',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: '#000000',
  },
  hero: {
    height: HERO_HEIGHT,
    width: HERO_WIDTH,
    overflow: 'hidden',
    backgroundColor: PAGE_BACKGROUND,
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: HERO_WIDTH,
    height: HERO_HEIGHT,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 48,
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 40,
    color: '#000000',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 16,
    lineHeight: 24,
    color: '#45464d',
    maxWidth: '92%',
  },
  formCard: {
    marginTop: -32,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c6c6cd',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 3,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#0b1c30',
    marginBottom: 8,
  },
  kycFieldLabel: {
    fontSize: 14,
    color: '#0b1c30',
    marginBottom: 8,
  },
  tripDateSubLabel: {
    fontSize: 12,
    color: '#45464d',
    marginBottom: 0,
  },
  fieldGap: {
    marginTop: 18,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff4ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c6c6cd',
    paddingHorizontal: 14,
    minHeight: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 12,
  },
  dateFieldText: {
    flex: 1,
    fontSize: 16,
    color: '#0b1c30',
    paddingVertical: 12,
  },
  dateFieldPlaceholder: {
    color: '#94A3B8',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countryCodeBox: {
    backgroundColor: '#e5eeff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c6c6cd',
    paddingHorizontal: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#45464d',
  },
  mobileInput: {
    flex: 1,
    backgroundColor: '#eff4ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c6c6cd',
    paddingHorizontal: 14,
    minHeight: 48,
    fontSize: 16,
    color: '#0b1c30',
  },
  tripDateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tripDateField: {
    flex: 1,
    gap: 6,
  },
  tripDateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff4ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c6c6cd',
    paddingHorizontal: 14,
    minHeight: 48,
    gap: 8,
  },
  tripDateValue: {
    flex: 1,
    fontSize: 16,
    color: '#0b1c30',
  },
  verifyBtn: {
    minHeight: 56,
    borderRadius: 8,
    backgroundColor: '#0051d5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  verifyBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  verifyBtnPressed: {
    opacity: 0.9,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  trustSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 16,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  trustCopy: {
    flex: 1,
  },
  trustTitle: {
    fontSize: 15,
    color: '#111827',
    marginBottom: 4,
  },
  trustDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
  },
});

export default TravelInsuranceKycScreen;

import React, { useState } from 'react';
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
import Svg, { Path } from 'react-native-svg';

import { Service } from '../../services/types/service.types';

type Props = {
  service: Service;
  onBack: () => void;
};

type FormData = {
  name: string;
  phone: string;
  email: string;
  city: string;
  additionalField: string;
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

function getAdditionalField(name: string): { label: string; placeholder: string } {
  const lower = name.toLowerCase();
  if (lower.includes('two') || lower.includes('bike') || lower.includes('two-wheeler')) {
    return { label: 'Vehicle Number', placeholder: 'e.g. MH 12 AB 1234' };
  }
  if (lower.includes('car')) {
    return { label: 'Vehicle Number', placeholder: 'e.g. MH 12 AB 1234' };
  }
  if (lower.includes('personal accident') || lower.includes('accident')) {
    return { label: 'Occupation', placeholder: 'e.g. Salaried, Self-employed' };
  }
  if (lower.includes('top-up') || lower.includes('super')) {
    return { label: 'Existing Coverage Amount', placeholder: 'e.g. ₹5 Lakh' };
  }
  return { label: 'Additional Details', placeholder: 'Any additional information' };
}

function OtherInsuranceEnquiryScreen({ service, onBack }: Props) {
  const [form, setForm] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    city: '',
    additionalField: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);

  const extraField = getAdditionalField(service.name);

  function set(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function validate() {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit mobile number';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.city.trim()) e.city = 'City is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (validate()) setSubmitted(true);
  }

  if (submitted) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
            <BackIcon />
          </Pressable>
          <Text style={styles.headerTitle}>Enquiry Submitted</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>✅</Text>
          </View>
          <Text style={styles.successTitle}>Enquiry Submitted!</Text>
          <Text style={styles.successSub}>
            Thank you, {form.name.split(' ')[0]}!{'\n'}
            Our expert will call you on <Text style={styles.successPhone}>{form.phone}</Text> within 24 hours.
          </Text>
          <Text style={styles.successService}>Service: {service.name}</Text>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.doneBtn, pressed && styles.pressed]}>
            <Text style={styles.doneBtnText}>Back to Insurance</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
            <BackIcon />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {service.name}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.formHeading}>Submit Enquiry</Text>
          <Text style={styles.formSub}>
            Our team will reach out to you with the best options.
          </Text>

          {/* Full Name */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[styles.input, !!errors.name && styles.inputError]}
              placeholder="Enter your full name"
              placeholderTextColor="#AAAAAA"
              value={form.name}
              onChangeText={v => set('name', v)}
            />
            {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Mobile */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Mobile Number *</Text>
            <TextInput
              style={[styles.input, !!errors.phone && styles.inputError]}
              placeholder="10-digit mobile number"
              placeholderTextColor="#AAAAAA"
              keyboardType="phone-pad"
              maxLength={10}
              value={form.phone}
              onChangeText={v => set('phone', v)}
            />
            {!!errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Email (optional)</Text>
            <TextInput
              style={[styles.input, !!errors.email && styles.inputError]}
              placeholder="your@email.com"
              placeholderTextColor="#AAAAAA"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={v => set('email', v)}
            />
            {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* City */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={[styles.input, !!errors.city && styles.inputError]}
              placeholder="Your city"
              placeholderTextColor="#AAAAAA"
              value={form.city}
              onChangeText={v => set('city', v)}
            />
            {!!errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          </View>

          {/* Service-specific field */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>{extraField.label} (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder={extraField.placeholder}
              placeholderTextColor="#AAAAAA"
              value={form.additionalField}
              onChangeText={v => set('additionalField', v)}
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [styles.submitBtn, pressed && styles.pressed]}>
            <Text style={styles.submitBtnText}>Submit Enquiry</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    fontSize: 16,
    fontWeight: '700',
    color: '#14532D',
    paddingHorizontal: 8,
  },
  headerSpacer: { width: 34 },

  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

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
    marginBottom: 24,
  },

  fieldWrap: { marginBottom: 20 },
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

  submitBtn: {
    backgroundColor: '#6B21A8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  pressed: { opacity: 0.82 },

  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successEmoji: { fontSize: 36 },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  successPhone: { fontWeight: '700', color: '#14532D' },
  successService: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 32,
    textAlign: 'center',
  },
  doneBtn: {
    backgroundColor: '#6B21A8',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  doneBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});

export default OtherInsuranceEnquiryScreen;

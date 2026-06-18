import type { EnquiryField } from '../types/service.types';

const EMAIL_FIELD_NAMES = new Set(['email', 'email_id']);
const MOBILE_FIELD_NAMES = new Set([
  'mobile',
  'mobile_number',
  'phone',
  'contact_number',
]);

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Indian mobile: 10 digits, starts with 6–9; allows +91 prefix. */
export function normalizeMobileDigits(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 10) {
    return digits;
  }
  return digits;
}

export function isValidMobile(value: string): boolean {
  const digits = normalizeMobileDigits(value);
  return /^[6-9]\d{9}$/.test(digits);
}

function isEmailField(field: EnquiryField): boolean {
  return EMAIL_FIELD_NAMES.has(field.field_name.toLowerCase());
}

function isMobileField(field: EnquiryField): boolean {
  return MOBILE_FIELD_NAMES.has(field.field_name.toLowerCase());
}

export function validateEnquiryForm(
  values: Record<string, string>,
  fields: EnquiryField[],
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const raw = values[field.field_name] ?? '';
    const val = raw.trim();

    if (field.is_required === 1 && !val) {
      errors[field.field_name] = `${field.label} is required.`;
      continue;
    }

    if (!val) {
      continue;
    }

    if (isEmailField(field) && !isValidEmail(val)) {
      errors[field.field_name] = 'Please enter a valid email address.';
    }

    if (isMobileField(field) && !isValidMobile(val)) {
      errors[field.field_name] =
        'Please enter a valid 10-digit mobile number (starts with 6–9).';
    }
  }

  return errors;
}

import type { UserProfile } from '../../../services/auth.service';
import { normalizeMobileDigits } from './enquiryValidation';

export function pickFormValue(values: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const value = values[key]?.trim();
    if (value) {
      return value;
    }
  }
  return '';
}

export function extractContactFromForm(values: Record<string, string>): {
  name: string;
  mobile: string;
  email: string;
  city: string;
  message: string;
} {
  const mobileRaw = pickFormValue(
    values,
    'mobile',
    'mobile_number',
    'phone',
    'contact_number',
    'contact',
  );

  const mobile =
    mobileRaw.replace(/\D/g, '').length >= 10
      ? normalizeMobileDigits(mobileRaw)
      : mobileRaw;

  return {
    name: pickFormValue(values, 'name', 'full_name', 'customer_name', 'applicant_name'),
    mobile,
    email: pickFormValue(values, 'email', 'email_id').toLowerCase(),
    city: pickFormValue(values, 'city', 'location'),
    message:
      pickFormValue(values, 'message', 'comments', 'enquiry', 'description') ||
      'I am interested in your services. Please contact me.',
  };
}

export function contactFromProfile(profile: UserProfile | null | undefined): {
  name: string;
  mobile: string;
  email: string;
} {
  if (!profile) {
    return { name: '', mobile: '', email: '' };
  }

  const mobileRaw = String(profile.contactNumber ?? '').trim();
  const mobile =
    mobileRaw.replace(/\D/g, '').length >= 10
      ? normalizeMobileDigits(mobileRaw)
      : mobileRaw;

  return {
    name: String(profile.name ?? '').trim(),
    mobile,
    email: String(profile.email ?? '').trim().toLowerCase(),
  };
}

export function mergeContactValues(
  formValues: Record<string, string>,
  profile: UserProfile | null | undefined,
): Record<string, string> {
  const fromProfile = contactFromProfile(profile);
  const merged = { ...formValues };

  if (!pickFormValue(merged, 'name', 'full_name', 'customer_name') && fromProfile.name) {
    merged.name = fromProfile.name;
  }
  if (
    !pickFormValue(merged, 'mobile', 'mobile_number', 'phone', 'contact_number') &&
    fromProfile.mobile
  ) {
    merged.mobile = fromProfile.mobile;
  }
  if (!pickFormValue(merged, 'email', 'email_id') && fromProfile.email) {
    merged.email = fromProfile.email;
  }

  return merged;
}

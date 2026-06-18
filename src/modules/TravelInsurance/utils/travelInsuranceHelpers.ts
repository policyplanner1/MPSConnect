import type {
  CkycApiResponse,
  CkycResponseData,
  TravelInsuranceSession,
  VerifyFormData,
} from '../types/travelInsurance.types';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const TITLES = new Set(['MR', 'MRS', 'MS', 'DR', 'SHRI', 'SMT', 'MISS']);

export function parseDobInput(value: string): Date | null {
  const match = value.match(/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(\d{4})$/);
  if (!match) {
    return null;
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function ddMmYyyyToApiDob(value: string): string {
  const date = parseDobInput(value);
  if (!date) {
    return value;
  }
  return `${String(date.getDate()).padStart(2, '0')}-${MONTHS[date.getMonth()]}-${date.getFullYear()}`;
}

export function apiDobToDdMmYyyy(value: string): string {
  const match = value.match(/^(\d{2})-([A-Z]{3})-(\d{4})$/i);
  if (!match) {
    return value;
  }
  const monthIndex = MONTHS.indexOf(match[2].toUpperCase());
  if (monthIndex < 0) {
    return value;
  }
  return `${match[1]}-${String(monthIndex + 1).padStart(2, '0')}-${match[3]}`;
}

export function apiDobToDisplay(value: string): string {
  const match = value.match(/^(\d{2})-([A-Z]{3})-(\d{4})$/i);
  if (!match) {
    return value;
  }
  const monthIndex = MONTHS.indexOf(match[2].toUpperCase());
  if (monthIndex < 0) {
    return value;
  }
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${Number(match[1])} ${monthNames[monthIndex]} ${match[3]}`;
}

export function formatDobInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

export function getDefaultTripDates(): { fromDate: string; toDate: string } {
  const from = new Date();
  from.setDate(from.getDate() + 7);
  const to = new Date(from);
  to.setDate(to.getDate() + 7);
  return {
    fromDate: toIsoDate(from),
    toDate: toIsoDate(to),
  };
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(iso: string): Date | null {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (
    date.getFullYear() !== Number(match[1]) ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[3])
  ) {
    return null;
  }
  return date;
}

export function formatIsoDateDisplay(iso: string): string {
  const date = parseIsoDate(iso);
  if (!date) {
    return iso;
  }
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

export function generateTripDateOptions(
  minDateIso?: string,
  count = 120,
): Array<{ label: string; value: string }> {
  const options: Array<{ label: string; value: string }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let start: Date;
  if (minDateIso) {
    const minDate = parseIsoDate(minDateIso);
    start = minDate ? new Date(minDate) : new Date(today);
    start.setDate(start.getDate() + 1);
  } else {
    start = new Date(today);
    start.setDate(start.getDate() + 1);
  }

  for (let index = 0; index < count; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const value = toIsoDate(date);
    options.push({ label: formatIsoDateDisplay(value), value });
  }

  return options;
}

export function isValidTripDateRange(fromDate: string, toDate: string): boolean {
  const from = parseIsoDate(fromDate);
  const to = parseIsoDate(toDate);
  if (!from || !to) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return from >= today && to > from;
}

export function dateToDobString(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

export function dobStringToDate(dob: string): Date | null {
  return parseDobInput(dob);
}

export function isoToDate(iso: string): Date | null {
  return parseIsoDate(iso);
}

export function getMaxDobDate(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getMinTripStartDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getMaxTripEndDate(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function splitFullName(fullName: string): {
  firstName: string;
  middleName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: '', middleName: '', lastName: '' };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], middleName: '', lastName: '' };
  }
  if (parts.length === 2) {
    return { firstName: parts[0], middleName: '', lastName: parts[1] };
  }
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
}

function isTitle(value: string): boolean {
  return TITLES.has(value.toUpperCase().replace(/\./g, ''));
}

export function parseCkycName(
  ckyc: Pick<CkycResponseData, 'title' | 'fullName' | 'firstName' | 'middleName' | 'lastName'>,
): {
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
} {
  let title = (ckyc.title ?? '').trim().toUpperCase();
  if (title && !isTitle(title)) {
    title = '';
  }

  const rawFirst = (ckyc.firstName ?? '').trim();
  const rawMiddle = (ckyc.middleName ?? '').trim();
  const rawLast = (ckyc.lastName ?? '').trim();

  if (rawFirst && isTitle(rawFirst)) {
    title = title || rawFirst.toUpperCase();
    const parsed = splitFullName([rawMiddle, rawLast].filter(Boolean).join(' '));
    return { title: title || 'MR', ...parsed };
  }

  if (rawFirst || rawLast) {
    return {
      title: title || 'MR',
      firstName: rawFirst,
      middleName: rawMiddle,
      lastName: rawLast,
    };
  }

  if (ckyc.fullName) {
    const parts = ckyc.fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length > 0 && isTitle(parts[0])) {
      title = title || parts[0].toUpperCase();
      const parsed = splitFullName(parts.slice(1).join(' '));
      return { title: title || 'MR', ...parsed };
    }
    const parsed = splitFullName(ckyc.fullName);
    return { title: title || 'MR', ...parsed };
  }

  return { title: title || 'MR', firstName: '', middleName: '', lastName: '' };
}

export function getDisplayName(form: Pick<VerifyFormData, 'firstName' | 'middleName' | 'lastName'>): string {
  return [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ').trim();
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'TI';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function normalizeGender(value: string | null | undefined): string {
  if (!value) {
    return 'M';
  }
  const lower = value.toLowerCase();
  if (lower === 'male' || lower === 'm') {
    return 'M';
  }
  if (lower === 'female' || lower === 'f') {
    return 'F';
  }
  return value.toUpperCase().startsWith('F') ? 'F' : 'M';
}

export function genderLabel(value: string): string {
  return normalizeGender(value) === 'F' ? 'Female' : 'Male';
}

export function stripPhonePrefix(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
}

export function formatUserPhoneForApi(phone: string): string {
  return stripPhonePrefix(phone);
}

export function isValidIndianMobile(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(stripPhonePrefix(phone));
}

export function buildSessionFromCkyc(
  response: CkycApiResponse,
  pan: string,
  dobApi: string,
  mobile: string,
  fromDate: string,
  toDate: string,
): TravelInsuranceSession {
  const ckyc = response.ckycResponse;
  return {
    uuid: response.UUID,
    quoteNo: response.quote_no,
    userPhone: response.userPhone,
    userId: response.user_id,
    companyId: String(ckyc.company_id ?? 1018),
    planId: String(ckyc.plan_id ?? 173),
    ckyc,
    fromDate,
    toDate,
    pan,
    dobApi: ckyc.dob ?? dobApi,
    mobile,
  };
}

export function buildVerifyFormFromSession(session: TravelInsuranceSession): VerifyFormData {
  const ckyc = session.ckyc;
  const parsedName = parseCkycName(ckyc);

  return {
    title: parsedName.title,
    gender: normalizeGender(ckyc.gender),
    firstName: parsedName.firstName,
    middleName: parsedName.middleName,
    lastName: parsedName.lastName,
    pan: ckyc.docNumber ?? session.pan,
    dob: ckyc.dob ?? session.dobApi,
    mobile: stripPhonePrefix(session.mobile || session.userPhone),
    email: '',
    maritalStatus: 'SINGLE',
    nomineeName: '',
    fromDate: session.fromDate,
    toDate: session.toDate,
    building: ckyc.address1 ?? '',
    streetName: ckyc.address2 ?? '',
    city: ckyc.city ?? '',
    pincode: ckyc.pincode ?? '',
    state: ckyc.state ?? '',
  };
}

export function buildProposalPayload(
  session: TravelInsuranceSession,
  form: VerifyFormData,
) {
  const userPhone = formatUserPhoneForApi(form.mobile);
  if (!isValidIndianMobile(userPhone)) {
    throw new Error('Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
  }

  return {
    UUID: session.uuid,
    building: form.building.trim(),
    city: form.city.trim().toLowerCase(),
    company_id: session.companyId,
    dob: form.dob,
    docNumber: form.pan.trim().toUpperCase(),
    email: form.email.trim().toLowerCase(),
    firstName: form.firstName.trim().toUpperCase(),
    fromDate: form.fromDate,
    gender: normalizeGender(form.gender),
    lastName: form.lastName.trim().toUpperCase(),
    maritalstatus: form.maritalStatus.toUpperCase(),
    middleName: form.middleName.trim().toUpperCase(),
    nomineename: form.nomineeName.trim().toLowerCase(),
    pincode: form.pincode.trim(),
    plan_id: session.planId,
    quote_no: session.quoteNo,
    state: form.state.trim().toLowerCase(),
    streetname: form.streetName.trim().toLowerCase(),
    title: form.title.toUpperCase(),
    toDate: form.toDate,
    userPhone,
    telephone: userPhone,
    user_id: String(session.userId),
  };
}

export function formatCurrencyLimit(value: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return value;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

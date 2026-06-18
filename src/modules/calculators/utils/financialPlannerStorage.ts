import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  ExpenseEntry,
  FinancialProfile,
  LoanEntry,
} from '../types/financialPlanner';

const PROFILE_KEY = '@mpsconnect/financial_profile';
const EXPENSES_KEY = '@mpsconnect/financial_expenses';
const LOANS_KEY = '@mpsconnect/financial_loans';

const DEFAULT_PROFILE: FinancialProfile = {
  monthlySalary: 0,
  otherIncome: 0,
  updatedAt: new Date(0).toISOString(),
};

export async function loadFinancialProfile(): Promise<FinancialProfile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) {
      return { ...DEFAULT_PROFILE };
    }
    const p = JSON.parse(raw) as FinancialProfile;
    return {
      monthlySalary:
        typeof p.monthlySalary === 'number' && p.monthlySalary >= 0
          ? p.monthlySalary
          : 0,
      otherIncome:
        typeof p.otherIncome === 'number' && p.otherIncome >= 0 ? p.otherIncome : 0,
      updatedAt: p.updatedAt ?? DEFAULT_PROFILE.updatedAt,
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export async function saveFinancialProfile(profile: FinancialProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadExpenses(): Promise<ExpenseEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(EXPENSES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ExpenseEntry[]) : [];
  } catch {
    return [];
  }
}

export async function saveExpenses(entries: ExpenseEntry[]): Promise<void> {
  await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(entries));
}

export async function loadLoans(): Promise<LoanEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(LOANS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as LoanEntry[]) : [];
  } catch {
    return [];
  }
}

export async function saveLoans(loans: LoanEntry[]): Promise<void> {
  await AsyncStorage.setItem(LOANS_KEY, JSON.stringify(loans));
}

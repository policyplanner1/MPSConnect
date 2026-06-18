import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SavingsEntry, SavingsGoal } from '../types/savings';

const ENTRIES_KEY = '@mpsconnect/savings_entries';
const GOAL_KEY = '@mpsconnect/savings_goal';

const DEFAULT_GOAL: SavingsGoal = {
  targetRatePct: 30,
  targetAmountMonthly: null,
};

export async function loadSavingsEntries(): Promise<SavingsEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(ENTRIES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as SavingsEntry[]) : [];
  } catch {
    return [];
  }
}

export async function saveSavingsEntries(entries: SavingsEntry[]): Promise<void> {
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export async function loadSavingsGoal(): Promise<SavingsGoal> {
  try {
    const raw = await AsyncStorage.getItem(GOAL_KEY);
    if (!raw) {
      return { ...DEFAULT_GOAL };
    }
    const g = JSON.parse(raw) as SavingsGoal;
    return {
      targetRatePct:
        typeof g.targetRatePct === 'number' && g.targetRatePct > 0 ? g.targetRatePct : 30,
      targetAmountMonthly:
        typeof g.targetAmountMonthly === 'number' && g.targetAmountMonthly > 0
          ? g.targetAmountMonthly
          : null,
    };
  } catch {
    return { ...DEFAULT_GOAL };
  }
}

export async function saveSavingsGoal(goal: SavingsGoal): Promise<void> {
  await AsyncStorage.setItem(GOAL_KEY, JSON.stringify(goal));
}

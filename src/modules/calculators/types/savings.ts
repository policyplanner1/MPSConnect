export type SavingsRecurrence = 'oneTime' | 'monthly' | 'yearly';

export type SavingsEntry = {
  id: string;
  categoryId: string;
  itemName: string;
  oldCost: number;
  newCost: number;
  /** Anchor period (first month this entry applies). */
  month: number;
  year: number;
  recurrence: SavingsRecurrence;
  createdAt: string;
};

export type SavingsGoal = {
  /** Target saving rate as % of old spend (e.g. 30 = 30%). */
  targetRatePct: number;
  /** Optional rupee target saved per month. */
  targetAmountMonthly: number | null;
};

export type CompareGranularity = 'monthly' | 'quarterly' | 'yearly';

export type MonthYear = { month: number; year: number };

export type QuarterPeriod = { year: number; quarter: 1 | 2 | 3 | 4 };

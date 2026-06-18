import type {
  ExpenseEntry,
  FinancialProfile,
  FinancialSnapshot,
  LoanEntry,
  RecommendationItem,
} from '../types/financialPlanner';

export function createPlannerId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function totalMonthlyIncome(profile: FinancialProfile): number {
  return Math.max(0, profile.monthlySalary) + Math.max(0, profile.otherIncome);
}

export function expensesInMonth(
  entries: ExpenseEntry[],
  month: number,
  year: number,
): ExpenseEntry[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return entries.filter(e => e.date.startsWith(prefix));
}

export function totalExpensesForMonth(
  entries: ExpenseEntry[],
  month: number,
  year: number,
): number {
  return expensesInMonth(entries, month, year).reduce((s, e) => s + e.amount, 0);
}

export function totalLoanEmi(loans: LoanEntry[]): number {
  return loans.reduce((s, l) => s + Math.max(0, l.emiAmount), 0);
}

export function buildSnapshot(
  profile: FinancialProfile,
  expenses: ExpenseEntry[],
  loans: LoanEntry[],
  month: number,
  year: number,
): FinancialSnapshot {
  const totalIncome = totalMonthlyIncome(profile);
  const totalMonthlyExpense = totalExpensesForMonth(expenses, month, year);
  const totalEmi = totalLoanEmi(loans);
  const monthlySurplus = totalIncome - totalMonthlyExpense - totalEmi;
  const savingsCapacityPct =
    totalIncome > 0
      ? Math.max(0, Math.min(100, Math.round((monthlySurplus / totalIncome) * 1000) / 10))
      : 0;

  return {
    totalIncome,
    totalMonthlyExpense,
    totalEmi,
    monthlySurplus,
    savingsCapacityPct,
  };
}

export type DayExpenseGroup = {
  day: number;
  dateIso: string;
  entries: ExpenseEntry[];
  dayTotal: number;
};

export function groupExpensesByDay(
  entries: ExpenseEntry[],
  month: number,
  year: number,
): DayExpenseGroup[] {
  const inMonth = expensesInMonth(entries, month, year);
  const byDay = new Map<number, ExpenseEntry[]>();

  for (const e of inMonth) {
    const day = parseInt(e.date.slice(8, 10), 10);
    if (!Number.isFinite(day)) {
      continue;
    }
    const list = byDay.get(day) ?? [];
    list.push(e);
    byDay.set(day, list);
  }

  const days = Array.from(byDay.keys()).sort((a, b) => b - a);
  return days.map(day => {
    const list = byDay.get(day) ?? [];
    const dateIso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return {
      day,
      dateIso,
      entries: list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      dayTotal: list.reduce((s, x) => s + x.amount, 0),
    };
  });
}

export function monthLabel(month: number, year: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

export function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function buildRecommendations(snapshot: FinancialSnapshot): RecommendationItem[] {
  const income = snapshot.totalIncome;
  const expenseRatio = income > 0 ? snapshot.totalMonthlyExpense / income : 1;
  const emiRatio = income > 0 ? snapshot.totalEmi / income : 0;
  const surplus = snapshot.monthlySurplus;
  const savings = snapshot.savingsCapacityPct;

  const sipDesc =
    savings >= 25
      ? 'Strong surplus — consider starting or increasing SIP for long-term wealth.'
      : savings >= 10
        ? 'Moderate surplus — begin a small SIP and scale as expenses stabilise.'
        : 'Focus on controlling expenses and building an emergency fund before aggressive investing.';

  const insuranceDesc =
    emiRatio > 0.35 || expenseRatio > 0.7
      ? 'High fixed outflows — review term and health cover to protect the family.'
      : 'Adequate cover for life and health helps safeguard income and savings goals.';

  const taxDesc =
    income >= 50_000
      ? 'Plan 80C, 80D, and HRA declarations early to optimise take-home pay.'
      : 'Track salary components and deductions for smoother year-end tax filing.';

  const budgetDesc =
    expenseRatio > 0.6
      ? 'Expenses are high relative to income — use day-wise tracking to cut discretionary spend.'
      : 'Spending is under control — maintain budgets by category and review weekly.';

  return [
    {
      id: 'sip',
      title: 'SIP / Investment',
      description: sipDesc,
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
    },
    {
      id: 'insurance',
      title: 'Insurance',
      description: insuranceDesc,
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
    },
    {
      id: 'tax',
      title: 'Tax Planning',
      description: taxDesc,
      iconBg: '#FEF9C3',
      iconColor: '#CA8A04',
    },
    {
      id: 'budget',
      title: 'Budget Planning',
      description: budgetDesc,
      iconBg: '#F3E8FF',
      iconColor: '#7C3AED',
    },
  ];
}

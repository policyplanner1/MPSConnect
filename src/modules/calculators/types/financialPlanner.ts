export type FinancialProfile = {
  monthlySalary: number;
  otherIncome: number;
  updatedAt: string;
};

export type ExpenseEntry = {
  id: string;
  amount: number;
  categoryId: string;
  note: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  createdAt: string;
};

export type LoanEntry = {
  id: string;
  name: string;
  /** Monthly EMI the customer pays */
  emiAmount: number;
  createdAt: string;
};

export type FinancialSnapshot = {
  totalIncome: number;
  totalMonthlyExpense: number;
  totalEmi: number;
  monthlySurplus: number;
  savingsCapacityPct: number;
};

export type RecommendationId =
  | 'sip'
  | 'insurance'
  | 'tax'
  | 'budget';

export type RecommendationItem = {
  id: RecommendationId;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
};

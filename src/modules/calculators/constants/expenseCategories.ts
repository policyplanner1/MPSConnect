export type ExpenseCategory = {
  id: string;
  label: string;
  iconBg: string;
  iconColor: string;
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'food', label: 'Food & dining', iconBg: '#FEF3C7', iconColor: '#D97706' },
  { id: 'transport', label: 'Transport', iconBg: '#DBEAFE', iconColor: '#2563EB' },
  { id: 'shopping', label: 'Shopping', iconBg: '#F3E8FF', iconColor: '#7C3AED' },
  { id: 'bills', label: 'Bills & utilities', iconBg: '#E0E7FF', iconColor: '#4F46E5' },
  { id: 'health', label: 'Health', iconBg: '#DCFCE7', iconColor: '#16A34A' },
  { id: 'entertainment', label: 'Entertainment', iconBg: '#FCE7F3', iconColor: '#DB2777' },
  { id: 'education', label: 'Education', iconBg: '#CFFAFE', iconColor: '#0891B2' },
  { id: 'other', label: 'Other', iconBg: '#F3F4F6', iconColor: '#6B7280' },
];

export function expenseCategoryById(id: string): ExpenseCategory {
  return EXPENSE_CATEGORIES.find(c => c.id === id) ?? EXPENSE_CATEGORIES[7];
}

export type SavingsCategoryDef = {
  id: string;
  name: string;
  color: string;
};

export const SAVINGS_CATEGORIES: SavingsCategoryDef[] = [
  { id: 'groceries', name: 'Groceries', color: '#1D9E75' },
  { id: 'utilities', name: 'Utilities', color: '#378ADD' },
  { id: 'transport', name: 'Transport', color: '#BA7517' },
  { id: 'health', name: 'Health', color: '#9333EA' },
  { id: 'other', name: 'Other', color: '#6B7280' },
];

export function categoryById(id: string): SavingsCategoryDef {
  return SAVINGS_CATEGORIES.find(c => c.id === id) ?? SAVINGS_CATEGORIES[4];
}

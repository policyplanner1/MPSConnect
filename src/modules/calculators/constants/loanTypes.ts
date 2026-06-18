export const LOAN_TYPES = [
  'Education Loans',
  'Business Loans',
  'Personal Loans',
  'Credit Card Loans',
  'Gold Loans',
  'Auto Loans',
  'Home Loans',
] as const;

export type LoanType = (typeof LOAN_TYPES)[number];

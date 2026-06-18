export type CalculatorId =
  | 'emi'
  | 'loan'
  | 'sip'
  | 'incomeTax'
  | 'todo'
  | 'savings'
  | 'financialPlanner'
  | 'financialGoal';

export type CalculatorListItem = {
  id: CalculatorId;
  title: string;
  subtitle: string;
  accent: string;
};

export const CALCULATOR_LIST: CalculatorListItem[] = [
  {
    id: 'emi',
    title: 'EMI Calculator',
    subtitle: 'Monthly instalments for home, car, or personal loans',
    accent: '#5E02AF',
  },
  {
    id: 'loan',
    title: 'Loan Calculator',
    subtitle: 'Principal, interest, and total repayment overview',
    accent: '#0D9488',
  },
  {
    id: 'sip',
    title: 'SIP Calculator',
    subtitle: 'Project returns on systematic mutual fund investments',
    accent: '#2563EB',
  },
  {
    id: 'incomeTax',
    title: 'Income Tax Calculator',
    subtitle: '8 taxpayer types · FY 2025-26 per Income Tax Dept slabs',
    accent: '#0F6E56',
  },
  {
    id: 'todo',
    title: 'To-Do List',
    subtitle: 'Tasks, priorities, due dates — with search and filters',
    accent: '#2563EB',
  },
  {
    id: 'savings',
    title: 'Savings tracker',
    subtitle: 'Track spend cuts, compare periods, and hit your savings goals',
    accent: '#047857',
  },
  {
    id: 'financialPlanner',
    title: 'Expense & financial planner',
    subtitle: 'Income, day-wise expenses, loans EMI, snapshot & recommendations',
    accent: '#1D4ED8',
  },
  {
    id: 'financialGoal',
    title: 'Financial goal planner',
    subtitle: 'Inflation-adjusted target, required SIP & lumpsum for your goals',
    accent: '#7C3AED',
  },
];

import type { CalculatorId } from './calculatorTypes';

export type CalculatorGridItem = {
  id: CalculatorId;
  title: string;
  iconBg: string;
  icon: 'emi' | 'loan' | 'sip' | 'tax';
};

export const CALCULATOR_GRID: CalculatorGridItem[] = [
  {
    id: 'emi',
    title: 'EMI Calculator',
    iconBg: '#DBEAFE',
    icon: 'emi',
  },
  {
    id: 'loan',
    title: 'Loan Calculator',
    iconBg: '#FEF3C7',
    icon: 'loan',
  },
  {
    id: 'sip',
    title: 'SIP Calculator',
    iconBg: '#E0F2FE',
    icon: 'sip',
  },
  {
    id: 'incomeTax',
    title: 'Tax Calculator',
    iconBg: '#FCE7F3',
    icon: 'tax',
  },
];

export const PLANNING_ITEMS: {
  id: CalculatorId;
  title: string;
  subtitle: string;
  iconBg: string;
  icon: 'planner' | 'savings' | 'goal';
  showProgress?: boolean;
}[] = [
  {
    id: 'financialPlanner',
    title: 'Expense & Financial Planner',
    subtitle: 'Stay on top of your monthly spends',
    iconBg: '#1E3A5F',
    icon: 'planner',
  },
  {
    id: 'savings',
    title: 'Savings Tracker',
    subtitle: '',
    iconBg: '#DBEAFE',
    icon: 'savings',
    showProgress: true,
  },
  {
    id: 'financialGoal',
    title: 'Financial Goal Planner',
    subtitle: 'Plan for retirement, home, or education',
    iconBg: '#FFEDD5',
    icon: 'goal',
  },
];

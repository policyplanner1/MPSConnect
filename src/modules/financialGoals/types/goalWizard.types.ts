import type { GoalTypeId } from '../constants/goalOptions';
import type { FinancialGoalInputs, FinancialGoalResults } from '../services/goalCalculator';

export type GoalWizardStep =
  | 'welcome'
  | 'choose'
  | 'personal'
  | 'details'
  | 'summary'
  | 'result';

export const WIZARD_INPUT_STEPS = 5;

export type GoalWizardFormState = {
  selectedGoalId: GoalTypeId;
  fullName: string;
  age: string;
  city: string;
  monthlyIncome: string;
  monthlyExpense: string;
  existingSavings: string;
  targetAmount: string;
  yearsToGoal: string;
  currentInvestment: string;
  expectedReturn: string;
  inflationRate: string;
  emergencyBackupMonths: number;
};

export type GoalWizardSnapshot = {
  form: GoalWizardFormState;
  inputs: FinancialGoalInputs;
  results: FinancialGoalResults;
};

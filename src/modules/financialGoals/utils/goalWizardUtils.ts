import {
  DEFAULT_INFLATION_PERCENT,
  DEFAULT_RETURN_PERCENT,
  getGoalById,
  GOAL_TYPES,
  INPUT_LIMITS,
  type GoalTypeId,
} from '../constants/goalOptions';
import { computeFinancialGoalPlan } from '../services/goalCalculator';
import type { GoalWizardFormState, GoalWizardSnapshot } from '../types/goalWizard.types';

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function parseNum(raw: string): number {
  const n = parseFloat(raw.replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}

export function formatAmountInput(n: number): string {
  if (!Number.isFinite(n) || n <= 0) {
    return '';
  }
  return String(Math.round(n));
}

export function createInitialFormState(goalId: GoalTypeId = GOAL_TYPES[0].id): GoalWizardFormState {
  const goal = getGoalById(goalId);
  return {
    selectedGoalId: goal.id,
    fullName: '',
    age: '',
    city: '',
    monthlyIncome: '',
    monthlyExpense: '',
    existingSavings: '',
    targetAmount: formatAmountInput(goal.defaultCost),
    yearsToGoal: String(goal.defaultYears),
    currentInvestment: '',
    expectedReturn: String(DEFAULT_RETURN_PERCENT),
    inflationRate: String(DEFAULT_INFLATION_PERCENT),
    emergencyBackupMonths: 6,
  };
}

export function formToCalculatorInputs(form: GoalWizardFormState) {
  const goal = getGoalById(form.selectedGoalId);
  let currentGoalCost = clamp(
    parseNum(form.targetAmount),
    INPUT_LIMITS.minCost,
    INPUT_LIMITS.maxCost,
  );

  if (goal.id === 'emergency') {
    const expense = parseNum(form.monthlyExpense);
    if (expense > 0) {
      currentGoalCost = clamp(
        expense * form.emergencyBackupMonths,
        INPUT_LIMITS.minCost,
        INPUT_LIMITS.maxCost,
      );
    }
  }

  return {
    currentGoalCost,
    amountAlreadyHave: clamp(
      parseNum(form.currentInvestment),
      INPUT_LIMITS.minAlreadyHave,
      INPUT_LIMITS.maxAlreadyHave,
    ),
    yearsToGoal: clamp(parseNum(form.yearsToGoal), INPUT_LIMITS.minYears, INPUT_LIMITS.maxYears),
    inflationRatePercent: clamp(
      parseNum(form.inflationRate),
      INPUT_LIMITS.minInflation,
      INPUT_LIMITS.maxInflation,
    ),
    expectedReturnPercent: clamp(
      parseNum(form.expectedReturn),
      INPUT_LIMITS.minReturn,
      INPUT_LIMITS.maxReturn,
    ),
  };
}

export function buildWizardSnapshot(form: GoalWizardFormState): GoalWizardSnapshot {
  const inputs = formToCalculatorInputs(form);
  return {
    form,
    inputs,
    results: computeFinancialGoalPlan(inputs),
  };
}

export function isChooseStepValid(goalId: GoalTypeId): boolean {
  return GOAL_TYPES.some(g => g.id === goalId);
}

export function isPersonalStepValid(form: GoalWizardFormState): boolean {
  const name = form.fullName.trim();
  const age = parseNum(form.age);
  return name.length >= 2 && age >= INPUT_LIMITS.minAge && age <= INPUT_LIMITS.maxAge;
}

export function isDetailsStepValid(form: GoalWizardFormState): boolean {
  const inputs = formToCalculatorInputs(form);
  return inputs.currentGoalCost >= INPUT_LIMITS.minCost && inputs.yearsToGoal >= INPUT_LIMITS.minYears;
}

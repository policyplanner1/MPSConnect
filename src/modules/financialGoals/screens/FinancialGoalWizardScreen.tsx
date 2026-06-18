import React, { useCallback, useMemo, useState } from 'react';

import type { GoalTypeId } from '../constants/goalOptions';
import { getGoalById } from '../constants/goalOptions';
import type { GoalWizardFormState, GoalWizardSnapshot, GoalWizardStep } from '../types/goalWizard.types';
import {
  buildWizardSnapshot,
  createInitialFormState,
  formatAmountInput,
  parseNum,
} from '../utils/goalWizardUtils';
import FinancialGoalChooseScreen from './FinancialGoalChooseScreen';
import FinancialGoalDetailsScreen from './FinancialGoalDetailsScreen';
import FinancialGoalPersonalScreen from './FinancialGoalPersonalScreen';
import FinancialGoalResultScreen from './FinancialGoalResultScreen';
import FinancialGoalSummaryScreen from './FinancialGoalSummaryScreen';
import FinancialGoalWelcomeScreen from './FinancialGoalWelcomeScreen';

type FinancialGoalWizardScreenProps = {
  onClose: () => void;
};

export default function FinancialGoalWizardScreen({ onClose }: FinancialGoalWizardScreenProps) {
  const [step, setStep] = useState<GoalWizardStep>('welcome');
  const [form, setForm] = useState<GoalWizardFormState>(() => createInitialFormState());
  const [snapshot, setSnapshot] = useState<GoalWizardSnapshot | null>(null);

  const patchForm = useCallback((patch: Partial<GoalWizardFormState>) => {
    setForm(prev => ({ ...prev, ...patch }));
  }, []);

  const selectGoal = useCallback((id: GoalTypeId) => {
    const goal = getGoalById(id);
    setForm(prev => ({
      ...prev,
      selectedGoalId: id,
      targetAmount: formatAmountInput(goal.defaultCost),
      yearsToGoal: String(goal.defaultYears),
    }));
  }, []);

  const calculatePlan = useCallback(() => {
    const next = buildWizardSnapshot(form);
    setSnapshot(next);
    setStep('summary');
  }, [form]);

  const viewFullPlan = useCallback(() => {
    if (snapshot) {
      setStep('result');
    }
  }, [snapshot]);

  const editDetails = useCallback(() => {
    setStep('details');
  }, []);

  const continueToDetails = useCallback(() => {
    if (form.selectedGoalId === 'emergency') {
      const expense = parseNum(form.monthlyExpense);
      if (expense > 0) {
        patchForm({
          targetAmount: formatAmountInput(expense * form.emergencyBackupMonths),
        });
      }
    }
    setStep('details');
  }, [form.selectedGoalId, form.monthlyExpense, form.emergencyBackupMonths, patchForm]);

  const startOver = useCallback(() => {
    setForm(createInitialFormState());
    setSnapshot(null);
    setStep('welcome');
  }, []);

  const activeSnapshot = useMemo(() => snapshot ?? buildWizardSnapshot(form), [snapshot, form]);

  if (step === 'welcome') {
    return (
      <FinancialGoalWelcomeScreen onBack={onClose} onContinue={() => setStep('choose')} />
    );
  }

  if (step === 'choose') {
    return (
      <FinancialGoalChooseScreen
        selectedGoalId={form.selectedGoalId}
        onSelectGoal={selectGoal}
        onBack={() => setStep('welcome')}
        onContinue={() => setStep('personal')}
      />
    );
  }

  if (step === 'personal') {
    return (
      <FinancialGoalPersonalScreen
        form={form}
        onChange={patchForm}
        onBack={() => setStep('choose')}
        onContinue={continueToDetails}
      />
    );
  }

  if (step === 'details') {
    return (
      <FinancialGoalDetailsScreen
        form={form}
        onChange={patchForm}
        onBack={() => setStep('personal')}
        onCalculate={calculatePlan}
      />
    );
  }

  if (step === 'summary') {
    return (
      <FinancialGoalSummaryScreen
        snapshot={activeSnapshot}
        onBack={() => setStep('details')}
        onViewFullPlan={viewFullPlan}
        onEditDetails={editDetails}
      />
    );
  }

  return (
    <FinancialGoalResultScreen
      snapshot={activeSnapshot}
      onBack={() => setStep('summary')}
      onEditDetails={editDetails}
      onStartOver={startOver}
    />
  );
}

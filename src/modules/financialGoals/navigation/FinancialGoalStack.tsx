import React from 'react';

import FinancialGoalWizardScreen from '../screens/FinancialGoalWizardScreen';

type FinancialGoalStackProps = {
  onClose: () => void;
};

export default function FinancialGoalStack({ onClose }: FinancialGoalStackProps) {
  return <FinancialGoalWizardScreen onClose={onClose} />;
}

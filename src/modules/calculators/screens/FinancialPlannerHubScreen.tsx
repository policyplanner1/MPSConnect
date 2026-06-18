import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalculatorHeader from '../components/CalculatorHeader';
import PlannerBottomTabs, { type PlannerMainTab } from '../components/PlannerBottomTabs';
import PlannerShortcuts from '../components/PlannerShortcuts';
import type { ExpenseEntry, FinancialProfile, LoanEntry } from '../types/financialPlanner';
import { buildSnapshot } from '../utils/financialPlannerEngine';
import {
  loadExpenses,
  loadFinancialProfile,
  loadLoans,
  saveExpenses,
  saveFinancialProfile,
  saveLoans,
} from '../utils/financialPlannerStorage';
import ExpenseAddScreen from './financialPlanner/ExpenseAddScreen';
import FinancialSnapshotScreen from './financialPlanner/FinancialSnapshotScreen';
import IncomeDetailsScreen from './financialPlanner/IncomeDetailsScreen';
import LoansEmiScreen from './financialPlanner/LoansEmiScreen';
import MonthlyExpensesScreen from './financialPlanner/MonthlyExpensesScreen';
import RecommendationsScreen from './financialPlanner/RecommendationsScreen';

export type PlannerOverlay = 'income' | 'loans' | 'addExpense' | 'recommendations';

type FinancialPlannerHubScreenProps = {
  onBack: () => void;
  onOpenEmiCalculator: () => void;
  initialMainTab?: PlannerMainTab;
  onMainTabChange?: (tab: PlannerMainTab) => void;
  /** Re-open overlay after returning from EMI calculator (e.g. loans). */
  resumeOverlay?: PlannerOverlay | null;
  onResumeOverlayHandled?: () => void;
};

function FinancialPlannerHubScreen({
  onBack,
  onOpenEmiCalculator,
  initialMainTab = 'snapshot',
  onMainTabChange,
  resumeOverlay = null,
  onResumeOverlayHandled,
}: FinancialPlannerHubScreenProps) {
  const [mainTab, setMainTab] = useState<PlannerMainTab>(initialMainTab);
  const [overlay, setOverlay] = useState<PlannerOverlay | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FinancialProfile>({
    monthlySalary: 0,
    otherIncome: 0,
    updatedAt: new Date(0).toISOString(),
  });
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [loans, setLoans] = useState<LoanEntry[]>([]);
  const [incomeSetupDone, setIncomeSetupDone] = useState(false);
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [addExpenseDate, setAddExpenseDate] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
  );

  const setTab = (tab: PlannerMainTab) => {
    setMainTab(tab);
    onMainTabChange?.(tab);
  };

  const closeOverlay = () => setOverlay(null);

  const reload = useCallback(async () => {
    const [p, e, l] = await Promise.all([
      loadFinancialProfile(),
      loadExpenses(),
      loadLoans(),
    ]);
    setProfile(p);
    setExpenses(e);
    setLoans(l);
    setLoading(false);
    if (p.monthlySalary > 0) {
      setIncomeSetupDone(true);
    } else {
      setOverlay('income');
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (resumeOverlay && !loading) {
      setOverlay(resumeOverlay);
      onResumeOverlayHandled?.();
    }
  }, [resumeOverlay, loading, onResumeOverlayHandled]);

  const snapshot = useMemo(
    () => buildSnapshot(profile, expenses, loans, viewMonth, viewYear),
    [profile, expenses, loans, viewMonth, viewYear],
  );

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth - 1 + delta, 1);
    setViewMonth(d.getMonth() + 1);
    setViewYear(d.getFullYear());
  };

  const handleDeleteExpense = useCallback(
    async (id: string) => {
      Alert.alert('Remove expense?', 'This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const next = expenses.filter(e => e.id !== id);
            await saveExpenses(next);
            setExpenses(next);
          },
        },
      ]);
    },
    [expenses],
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#2563EB" size="large" />
      </View>
    );
  }

  if (overlay === 'addExpense') {
    return (
      <ExpenseAddScreen
        defaultDate={addExpenseDate}
        onBack={closeOverlay}
        onSave={async entry => {
          const next = [...expenses, entry];
          await saveExpenses(next);
          setExpenses(next);
          setTab('expenses');
          closeOverlay();
        }}
      />
    );
  }

  if (overlay === 'recommendations') {
    return (
      <RecommendationsScreen
        snapshot={snapshot}
        onBack={closeOverlay}
        onCreateLead={() =>
          Alert.alert(
            'Create lead',
            'Connect this action to your CRM or leads module when ready.',
          )
        }
        onScheduleFollowUp={() =>
          Alert.alert(
            'Schedule follow-up',
            'Connect this to your calendar or tasks when ready.',
          )
        }
      />
    );
  }

  if (overlay === 'income') {
    return (
      <IncomeDetailsScreen
        isFirstSetup={!incomeSetupDone}
        profile={profile}
        onBack={incomeSetupDone ? closeOverlay : onBack}
        onSave={async next => {
          await saveFinancialProfile(next);
          setProfile(next);
          setIncomeSetupDone(true);
          setTab('snapshot');
          closeOverlay();
        }}
      />
    );
  }

  if (overlay === 'loans') {
    return (
      <LoansEmiScreen
        loans={loans}
        onBack={closeOverlay}
        onOpenEmiCalculator={onOpenEmiCalculator}
        onSaveLoans={async next => {
          await saveLoans(next);
          setLoans(next);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="PlanWealth" />
      <PlannerShortcuts
        onEditIncome={() => setOverlay('income')}
        onEditLoans={() => setOverlay('loans')}
        onRecommendations={() => setOverlay('recommendations')}
      />

      <View style={{ flex: 1 }}>
        {mainTab === 'snapshot' ? (
          <FinancialSnapshotScreen
            embedded
            snapshot={snapshot}
            onEditExpenses={() => setTab('expenses')}
            onEditIncome={() => setOverlay('income')}
            onEditLoans={() => setOverlay('loans')}
          />
        ) : (
          <MonthlyExpensesScreen
            embedded
            expenses={expenses}
            viewMonth={viewMonth}
            viewYear={viewYear}
            onAddExpense={() => {
              const today = new Date();
              const day =
                viewMonth === today.getMonth() + 1 && viewYear === today.getFullYear()
                  ? today.getDate()
                  : 1;
              setAddExpenseDate(
                `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
              );
              setOverlay('addExpense');
            }}
            onDeleteExpense={id => {
              void handleDeleteExpense(id);
            }}
            onShiftMonth={shiftMonth}
          />
        )}
      </View>

      <PlannerBottomTabs active={mainTab} onChange={setTab} />
    </SafeAreaView>
  );
}

export default FinancialPlannerHubScreen;

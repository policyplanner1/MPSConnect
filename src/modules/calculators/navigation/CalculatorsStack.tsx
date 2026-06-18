import React, { useCallback, useState } from 'react';

import type { CalculatorId } from '../constants/calculatorTypes';
import CalculatorHomeScreen from '../screens/CalculatorHomeScreen';
import EMICalculatorScreen from '../screens/EMICalculatorScreen';
import LoanCalculatorScreen from '../screens/LoanCalculatorScreen';
import SIPCalculatorScreen from '../screens/SIPCalculatorScreen';
import IncomeTaxCalculatorScreen from '../screens/IncomeTaxCalculatorScreen';
import TodoListScreen from '../screens/TodoListScreen';
import TodoFormScreen from '../screens/TodoFormScreen';
import SavingsHubScreen from '../screens/SavingsHubScreen';
import FinancialPlannerHubScreen, {
  type PlannerOverlay,
} from '../screens/FinancialPlannerHubScreen';
import { FinancialGoalStack } from '../../financialGoals';
import type { PlannerMainTab } from '../components/PlannerBottomTabs';
import type { TodoTask } from '../types/todo';
import { loadTodos, saveTodos } from '../utils/todoStorage';

type CalculatorsStackScreen =
  | 'Home'
  | 'EMI'
  | 'Loan'
  | 'SIP'
  | 'IncomeTax'
  | 'TodoList'
  | 'TodoForm'
  | 'Savings'
  | 'FinancialPlanner'
  | 'FinancialGoal';

type CalculatorsStackProps = {
  onClose: () => void;
};

function CalculatorsStack({ onClose }: CalculatorsStackProps) {
  const [screen, setScreen] = useState<CalculatorsStackScreen>('Home');
  const [returnAfterEmi, setReturnAfterEmi] = useState<CalculatorsStackScreen | null>(null);
  const [plannerMainTab, setPlannerMainTab] = useState<PlannerMainTab>('snapshot');
  const [plannerResumeOverlay, setPlannerResumeOverlay] = useState<PlannerOverlay | null>(
    null,
  );
  const [todoFormId, setTodoFormId] = useState<string | null>(null);
  const [todoFormTask, setTodoFormTask] = useState<TodoTask | null>(null);
  const [todoRefresh, setTodoRefresh] = useState(0);

  const openTodoForm = useCallback((task: TodoTask | null) => {
    setTodoFormId(task?.id ?? null);
    setTodoFormTask(task);
    setScreen('TodoForm');
  }, []);

  const handleTodoSave = useCallback(async (task: TodoTask) => {
    const existing = await loadTodos();
    const idx = existing.findIndex(t => t.id === task.id);
    const next =
      idx >= 0
        ? [...existing.slice(0, idx), task, ...existing.slice(idx + 1)]
        : [...existing, task];
    await saveTodos(next);
    setTodoRefresh(n => n + 1);
  }, []);

  const handleTodoDelete = useCallback(async (id: string) => {
    const existing = await loadTodos();
    const next = existing.filter(t => t.id !== id);
    await saveTodos(next);
    setTodoRefresh(n => n + 1);
  }, []);

  if (screen === 'EMI') {
    return (
      <EMICalculatorScreen
        onBack={() => {
          const target = returnAfterEmi ?? 'Home';
          setReturnAfterEmi(null);
          setScreen(target);
        }}
      />
    );
  }

  if (screen === 'Loan') {
    return <LoanCalculatorScreen onBack={() => setScreen('Home')} />;
  }

  if (screen === 'SIP') {
    return <SIPCalculatorScreen onBack={() => setScreen('Home')} />;
  }

  if (screen === 'IncomeTax') {
    return <IncomeTaxCalculatorScreen onBack={() => setScreen('Home')} />;
  }

  if (screen === 'TodoList') {
    return (
      <TodoListScreen
        refreshToken={todoRefresh}
        onAddTask={() => openTodoForm(null)}
        onBack={() => setScreen('Home')}
        onEditTask={task => openTodoForm(task)}
      />
    );
  }

  if (screen === 'TodoForm') {
    return (
      <TodoFormScreen
        initialTask={todoFormTask}
        taskId={todoFormId}
        onBack={() => setScreen('TodoList')}
        onDelete={handleTodoDelete}
        onSave={task => {
          void handleTodoSave(task);
        }}
      />
    );
  }

  if (screen === 'Savings') {
    return <SavingsHubScreen onBack={() => setScreen('Home')} />;
  }

  if (screen === 'FinancialGoal') {
    return <FinancialGoalStack onClose={() => setScreen('Home')} />;
  }

  if (screen === 'FinancialPlanner') {
    return (
      <FinancialPlannerHubScreen
        initialMainTab={plannerMainTab}
        resumeOverlay={plannerResumeOverlay}
        onBack={() => setScreen('Home')}
        onMainTabChange={setPlannerMainTab}
        onOpenEmiCalculator={() => {
          setPlannerResumeOverlay('loans');
          setReturnAfterEmi('FinancialPlanner');
          setScreen('EMI');
        }}
        onResumeOverlayHandled={() => setPlannerResumeOverlay(null)}
      />
    );
  }

  const handleSelect = (id: CalculatorId) => {
    if (id === 'emi') {
      setReturnAfterEmi(null);
      setScreen('EMI');
    } else if (id === 'loan') {
      setScreen('Loan');
    } else if (id === 'sip') {
      setScreen('SIP');
    } else if (id === 'incomeTax') {
      setScreen('IncomeTax');
    } else if (id === 'todo') {
      setScreen('TodoList');
    } else if (id === 'savings') {
      setScreen('Savings');
    } else if (id === 'financialPlanner') {
      setScreen('FinancialPlanner');
    } else if (id === 'financialGoal') {
      setScreen('FinancialGoal');
    }
  };

  return (
    <CalculatorHomeScreen onBack={onClose} onSelectCalculator={handleSelect} />
  );
}

export default CalculatorsStack;

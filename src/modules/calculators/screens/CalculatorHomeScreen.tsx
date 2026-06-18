import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import CalculatorHeader from '../components/CalculatorHeader';
import CalculatorHomeBackground from '../components/CalculatorHomeBackground';
import {
  CalendarIcon,
  ChevronRightIcon,
  GridCalculatorIcon,
  PlanningIcon,
} from '../components/CalculatorHomeIcons';
import {
  CALCULATOR_GRID,
  PLANNING_ITEMS,
} from '../constants/calculatorHomeLayout';
import type { CalculatorId } from '../constants/calculatorTypes';
import { inter18 } from '../../../core/theme/typography';
import type { TodoTask } from '../types/todo';
import { formatInr } from '../utils/formatter';
import { aggregateMonth } from '../utils/savingsEngine';
import { loadSavingsEntries, loadSavingsGoal } from '../utils/savingsStorage';
import { isTaskDueToday } from '../utils/todoHelpers';
import { loadTodos, saveTodos } from '../utils/todoStorage';

type CalculatorHomeScreenProps = {
  onBack?: () => void;
  onSelectCalculator: (id: CalculatorId) => void;
};

const NAVY = '#1E293B';
const TASK_BLUE = '#2563EB';
const GRID_GAP = 12;
const H_PADDING = 16;
const GRID_CARD_WIDTH =
  (Dimensions.get('window').width - H_PADDING * 2 - GRID_GAP) / 2;

function CheckIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <View style={styles.taskCheckOn}>
        <Svg height={14} viewBox="0 0 24 24" width={14}>
          <Path
            d="M5 12L10 17L19 7"
            fill="none"
            stroke="#FFFFFF"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
          />
        </Svg>
      </View>
    );
  }
  return <View style={styles.taskCheckOff} />;
}

function CalculatorHomeScreen({
  onBack,
  onSelectCalculator,
}: CalculatorHomeScreenProps) {
  const [todos, setTodos] = useState<TodoTask[]>([]);
  const [savingsProgressPct, setSavingsProgressPct] = useState(0);
  const [savingsGoalLabel, setSavingsGoalLabel] = useState('Set a savings goal');

  const loadHomeData = useCallback(async () => {
    const [tasks, entries, goal] = await Promise.all([
      loadTodos(),
      loadSavingsEntries(),
      loadSavingsGoal(),
    ]);
    setTodos(tasks);

    const now = new Date();
    const monthTotals = aggregateMonth(
      entries,
      now.getMonth(),
      now.getFullYear(),
    );
    const targetAmount =
      goal.targetAmountMonthly != null && goal.targetAmountMonthly > 0
        ? goal.targetAmountMonthly
        : 5000;
    const pct =
      targetAmount > 0
        ? Math.min(100, Math.round((monthTotals.totalSaved / targetAmount) * 100))
        : 0;
    setSavingsProgressPct(pct);
    setSavingsGoalLabel(
      `${pct}% of your ₹${formatInr(targetAmount)} goal reached`,
    );
  }, []);

  useEffect(() => {
    void loadHomeData();
  }, [loadHomeData]);

  const todayTasks = useMemo(() => {
    const now = new Date();
    return todos.filter(
      t => !t.completed && (isTaskDueToday(t, now) || !t.dueDate),
    );
  }, [todos]);

  const pendingCount = todayTasks.length;
  const previewTasks = todayTasks.slice(0, 3);

  const toggleTask = async (task: TodoTask) => {
    const nowIso = new Date().toISOString();
    const next = todos.map(t =>
      t.id === task.id
        ? {
            ...t,
            completed: !t.completed,
            completedAt: !t.completed ? nowIso : null,
            updatedAt: nowIso,
          }
        : t,
    );
    setTodos(next);
    await saveTodos(next);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHomeBackground>
        <CalculatorHeader onBack={onBack} title="PlanWealth" />
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          {/* Calculators grid */}
          <Text style={[styles.sectionTitle, inter18('bold')]}>Calculators</Text>
          <View style={styles.grid}>
            {CALCULATOR_GRID.map(item => (
              <Pressable
                key={item.id}
                onPress={() => onSelectCalculator(item.id)}
                style={({ pressed }) => [
                  styles.gridCard,
                  pressed && styles.pressed,
                ]}>
                <View style={[styles.gridIconWrap, { backgroundColor: item.iconBg }]}>
                  <GridCalculatorIcon type={item.icon} />
                </View>
                <Text style={[styles.gridLabel, inter18('bold')]} numberOfLines={2}>
                  {item.title}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Planning & Tracking */}
          <Text style={[styles.sectionTitle, inter18('bold')]}>Planning & Tracking</Text>
          <View style={styles.planningList}>
            {PLANNING_ITEMS.map(item => (
              <Pressable
                key={item.id}
                onPress={() => onSelectCalculator(item.id)}
                style={({ pressed }) => [
                  styles.planningCard,
                  pressed && styles.pressed,
                ]}>
                <View
                  style={[
                    styles.planningIconCircle,
                    { backgroundColor: item.iconBg },
                  ]}>
                  {item.icon !== 'planner' ? (
                    <PlanningIcon type={item.icon} />
                  ) : null}
                </View>
                <View style={styles.planningBody}>
                  <Text style={[styles.planningTitle, inter18('bold')]}>{item.title}</Text>
                  {item.showProgress ? (
                    <>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${Math.max(savingsProgressPct, 4)}%` },
                          ]}
                        />
                      </View>
                      <Text style={[styles.planningMeta, inter18('regular')]}>
                        {savingsGoalLabel}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.planningSubtitle, inter18('regular')]}>
                      {item.subtitle}
                    </Text>
                  )}
                </View>
                <ChevronRightIcon />
              </Pressable>
            ))}
          </View>

          {/* Daily Tasks */}
          <Text style={[styles.sectionTitle, inter18('bold')]}>Daily Tasks</Text>
          <View style={styles.tasksCard}>
            <View style={styles.tasksHeader}>
              <View>
                <Text style={[styles.tasksEyebrow, inter18('regular')]}>TODAY'S FOCUS</Text>
                <Text style={[styles.tasksHeadline, inter18('bold')]}>
                  {pendingCount} Task{pendingCount === 1 ? '' : 's'} Pending
                </Text>
              </View>
              <CalendarIcon />
            </View>

            {previewTasks.length === 0 ? (
              <Text style={[styles.tasksEmpty, inter18('regular')]}>
                No pending tasks for today. Add one from View All Tasks.
              </Text>
            ) : (
              previewTasks.map(task => (
                <Pressable
                  key={task.id}
                  onPress={() => toggleTask(task)}
                  style={styles.taskRow}>
                  <CheckIcon checked={task.completed} />
                  <Text
                    style={[
                      styles.taskText,
                      inter18('regular'),
                      task.completed && styles.taskTextDone,
                    ]}>
                    {task.title}
                  </Text>
                </Pressable>
              ))
            )}

            <Pressable
              onPress={() => onSelectCalculator('todo')}
              style={({ pressed }) => [
                styles.viewAllBtn,
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.viewAllText, inter18('bold')]}>View All Tasks</Text>
            </Pressable>
          </View>
        </ScrollView>
      </CalculatorHomeBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 12,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  gridCard: {
    width: GRID_CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  gridIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridLabel: {
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
    lineHeight: 18,
  },
  planningList: {
    gap: 10,
    marginBottom: 8,
  },
  planningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  planningIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planningBody: {
    flex: 1,
    gap: 6,
  },
  planningTitle: {
    fontSize: 15,
    color: '#111827',
  },
  planningSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  planningMeta: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: TASK_BLUE,
  },
  tasksCard: {
    backgroundColor: NAVY,
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  tasksEyebrow: {
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  tasksHeadline: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  tasksEmpty: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskCheckOff: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#64748B',
  },
  taskCheckOn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: TASK_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    color: '#F8FAFC',
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  viewAllBtn: {
    backgroundColor: TASK_BLUE,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.88,
  },
});

export default CalculatorHomeScreen;

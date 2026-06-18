import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import CalculatorHeader from '../../components/CalculatorHeader';
import { expenseCategoryById } from '../../constants/expenseCategories';
import type { ExpenseEntry } from '../../types/financialPlanner';
import {
  groupExpensesByDay,
  monthLabel,
  totalExpensesForMonth,
} from '../../utils/financialPlannerEngine';
import { formatInr } from '../../utils/formatter';
import { inter18 } from '../../../../core/theme/typography';

type MonthlyExpensesScreenProps = {
  expenses: ExpenseEntry[];
  viewMonth: number;
  viewYear: number;
  loading?: boolean;
  onAddExpense: () => void;
  onShiftMonth: (delta: number) => void;
  onDeleteExpense: (id: string) => void;
  embedded?: boolean;
  onBack?: () => void;
  onViewSnapshot?: () => void;
};

function ChevronLeft() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Path d="M15 5L8 12L15 19" fill="none" stroke="#111" strokeLinecap="round" strokeWidth={2} />
    </Svg>
  );
}

function ChevronRight() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Path d="M9 5L16 12L9 19" fill="none" stroke="#111" strokeLinecap="round" strokeWidth={2} />
    </Svg>
  );
}

function PlusIcon() {
  return (
    <Svg height={22} viewBox="0 0 24 24" width={22}>
      <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#FFFFFF" />
    </Svg>
  );
}

function MonthlyExpensesScreen({
  expenses,
  viewMonth,
  viewYear,
  loading,
  onBack,
  onAddExpense,
  onShiftMonth,
  onDeleteExpense,
  embedded = false,
}: MonthlyExpensesScreenProps) {
  const monthTotal = totalExpensesForMonth(expenses, viewMonth, viewYear);
  const groups = useMemo(
    () => groupExpensesByDay(expenses, viewMonth, viewYear),
    [expenses, viewMonth, viewYear],
  );

  const content = (
    <>
      <View style={styles.monthRow}>
        <Pressable hitSlop={8} onPress={() => onShiftMonth(-1)} style={styles.monthBtn}>
          <ChevronLeft />
        </Pressable>
        <Text style={[styles.monthLabel, inter18('semiBold')]}>{monthLabel(viewMonth, viewYear)}</Text>
        <Pressable hitSlop={8} onPress={() => onShiftMonth(1)} style={styles.monthBtn}>
          <ChevronRight />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, embedded && styles.scrollEmbedded]}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, inter18('bold')]}>Monthly Expenses</Text>
        <Text style={[styles.sub, inter18('regular')]}>
          Track spending day by day. Tap + to add an expense for any date.
        </Text>

        <View style={styles.totalBox}>
          <Text style={[styles.totalLabel, inter18('semiBold')]}>Total this month</Text>
          <Text style={[styles.totalValue, inter18('bold')]}>₹ {formatInr(monthTotal)}</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#2563EB" style={{ marginTop: 24 }} />
        ) : groups.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, inter18('semiBold')]}>No expenses yet</Text>
            <Text style={[styles.emptySub, inter18('regular')]}>
              Add your first expense to see a day-wise breakdown.
            </Text>
          </View>
        ) : (
          groups.map(group => (
            <View key={group.dateIso} style={styles.dayBlock}>
              <View style={styles.dayHeader}>
                <Text style={[styles.dayTitle, inter18('bold')]}>Day {group.day}</Text>
                <Text style={[styles.dayTotal, inter18('semiBold')]}>₹ {formatInr(group.dayTotal)}</Text>
              </View>
              {group.entries.map(entry => {
                const cat = expenseCategoryById(entry.categoryId);
                return (
                  <Pressable
                    key={entry.id}
                    onLongPress={() => onDeleteExpense(entry.id)}
                    style={styles.expenseRow}>
                    <View style={[styles.dot, { backgroundColor: cat.iconColor }]} />
                    <View style={styles.expenseBody}>
                      <Text style={[styles.expenseNote, inter18('medium')]} numberOfLines={1}>
                        {entry.note}
                      </Text>
                      <Text style={[styles.expenseCat, inter18('regular')]}>{cat.label}</Text>
                    </View>
                    <Text style={[styles.expenseAmt, inter18('bold')]}>₹ {formatInr(entry.amount)}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))
        )}
        <Text style={[styles.hint, inter18('regular')]}>Long-press an entry to remove it.</Text>
      </ScrollView>

      <Pressable
        onPress={onAddExpense}
        style={[styles.fab, embedded && styles.fabEmbedded]}>
        <PlusIcon />
      </Pressable>
    </>
  );

  if (embedded) {
    return <View style={styles.embeddedWrap}>{content}</View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="PlanWealth" />
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F7' },
  embeddedWrap: { flex: 1, backgroundColor: '#F7F7F7' },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  monthBtn: { padding: 8 },
  monthLabel: { fontSize: 15, color: '#111111', minWidth: 160, textAlign: 'center' },
  scroll: { padding: 16, paddingBottom: 100, gap: 12 },
  scrollEmbedded: { paddingBottom: 88 },
  heading: { fontSize: 22, color: '#111111' },
  sub: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  totalBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 14,
    gap: 4,
  },
  totalLabel: { fontSize: 13, color: '#B91C1C' },
  totalValue: { fontSize: 22, color: '#111111' },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
  dayBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayTitle: { fontSize: 14, color: '#111111' },
  dayTotal: { fontSize: 14, color: '#DC2626' },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  expenseBody: { flex: 1, gap: 2 },
  expenseNote: { fontSize: 14, color: '#111111' },
  expenseCat: { fontSize: 11, color: '#9CA3AF' },
  expenseAmt: { fontSize: 14, color: '#111111' },
  hint: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },
  fabEmbedded: {
    bottom: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 88,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default MonthlyExpensesScreen;

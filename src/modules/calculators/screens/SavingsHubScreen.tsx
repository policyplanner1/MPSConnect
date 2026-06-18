import React, { useCallback, useEffect, useState } from 'react';
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

import CalculatorHeader from '../components/CalculatorHeader';
import { categoryById } from '../constants/savingsCategories';
import SavingsAddEntryScreen from './SavingsAddEntryScreen';
import SavingsCompareScreen from './SavingsCompareScreen';
import SavingsGoalsScreen from './SavingsGoalsScreen';
import SavingsReportsScreen from './SavingsReportsScreen';
import type { SavingsEntry, SavingsGoal } from '../types/savings';
import {
  aggregateMonth,
  monthLabel,
  pctChangeVsPrev,
  prevMonth,
} from '../utils/savingsEngine';
import {
  loadSavingsEntries,
  loadSavingsGoal,
  saveSavingsEntries,
  saveSavingsGoal,
} from '../utils/savingsStorage';
import { formatInr } from '../utils/formatter';
import { inter18 } from '../../../core/theme/typography';

const GREEN_BAR = '#1D9E75';
const ACCENT = '#2563EB';

type SubScreen = 'dashboard' | 'add' | 'compare' | 'reports' | 'goals';

type SavingsHubScreenProps = {
  onBack: () => void;
};

function ChevronLeft() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Path
        d="M15 5L8 12L15 19"
        fill="none"
        stroke="#111111"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

function ChevronRight() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Path
        d="M9 5L16 12L9 19"
        fill="none"
        stroke="#111111"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

function PlusFab() {
  return (
    <Svg height={22} viewBox="0 0 24 24" width={22}>
      <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#FFFFFF" />
    </Svg>
  );
}

function SavingsHubScreen({ onBack }: SavingsHubScreenProps) {
  const [sub, setSub] = useState<SubScreen>('dashboard');
  const [entries, setEntries] = useState<SavingsEntry[]>([]);
  const [goal, setGoal] = useState<SavingsGoal>({ targetRatePct: 30, targetAmountMonthly: null });
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const reload = useCallback(async () => {
    const [e, g] = await Promise.all([loadSavingsEntries(), loadSavingsGoal()]);
    setEntries(e);
    setGoal(g);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleSaveEntry = useCallback(
    async (entry: SavingsEntry) => {
      const next = [...entries, entry];
      await saveSavingsEntries(next);
      setEntries(next);
    },
    [entries],
  );

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth - 1 + delta, 1);
    setViewMonth(d.getMonth() + 1);
    setViewYear(d.getFullYear());
  };

  if (sub === 'add') {
    return (
      <SavingsAddEntryScreen
        onBack={() => setSub('dashboard')}
        onSave={entry => {
          void handleSaveEntry(entry);
        }}
      />
    );
  }
  if (sub === 'compare') {
    return (
      <SavingsCompareScreen entries={entries} onBack={() => setSub('dashboard')} />
    );
  }
  if (sub === 'reports') {
    return <SavingsReportsScreen entries={entries} onBack={() => setSub('dashboard')} />;
  }
  if (sub === 'goals') {
    return (
      <SavingsGoalsScreen
        entries={entries}
        goal={goal}
        viewMonth={viewMonth}
        viewYear={viewYear}
        onBack={() => setSub('dashboard')}
        onGoalSaved={async g => {
          await saveSavingsGoal(g);
          setGoal(g);
        }}
      />
    );
  }

  const cur = aggregateMonth(entries, viewMonth, viewYear);
  const pm = prevMonth(viewMonth, viewYear);
  const prev = aggregateMonth(entries, pm.month, pm.year);
  const savedDeltaPct = pctChangeVsPrev(cur.totalSaved, prev.totalSaved);

  const goalRate = goal.targetRatePct > 0 ? goal.targetRatePct : 30;
  const progressPct =
    goalRate > 0 ? Math.min(100, (cur.savingRatePct / goalRate) * 100) : 0;

  const recent = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ).slice(0, 25);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="My savings" />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={ACCENT} size="large" />
        </View>
      ) : (
        <>
          <View style={styles.monthNav}>
            <Pressable hitSlop={8} onPress={() => shiftMonth(-1)} style={styles.monthBtn}>
              <ChevronLeft />
            </Pressable>
            <Text style={[styles.monthTitle, inter18('medium')]}>
              {monthLabel({ month: viewMonth, year: viewYear })}
            </Text>
            <Pressable hitSlop={8} onPress={() => shiftMonth(1)} style={styles.monthBtn}>
              <ChevronRight />
            </Pressable>
          </View>

          <ScrollView
            bounces={false}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}>
            <View style={styles.navChips}>
              {(
                [
                  ['compare', 'Compare'],
                  ['reports', 'Reports'],
                  ['goals', 'Goals'],
                ] as const
              ).map(([key, label]) => (
                <Pressable
                  key={key}
                  onPress={() => setSub(key)}
                  style={styles.navChip}>
                  <Text style={[styles.navChipText, inter18('medium')]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.grid}>
              <View style={styles.metric}>
                <Text style={[styles.metricLbl, inter18('medium')]}>Total saved</Text>
                <Text style={[styles.metricVal, inter18('semiBold')]}>
                  ₹ {formatInr(cur.totalSaved)}
                </Text>
                <Text
                  style={[
                    styles.metricSub,
                    inter18('regular'),
                    savedDeltaPct != null && savedDeltaPct >= 0 ? styles.pos : styles.neg,
                  ]}>
                  {savedDeltaPct == null
                    ? '— vs last mo'
                    : `${savedDeltaPct >= 0 ? '+' : ''}${savedDeltaPct}% vs last mo`}
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={[styles.metricLbl, inter18('medium')]}>Old spend</Text>
                <Text style={[styles.metricVal, inter18('semiBold')]}>
                  ₹ {formatInr(cur.oldSpend)}
                </Text>
                <Text style={[styles.metricSub, inter18('regular'), styles.muted]}>
                  Before changes
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={[styles.metricLbl, inter18('medium')]}>New spend</Text>
                <Text style={[styles.metricVal, inter18('semiBold')]}>
                  ₹ {formatInr(cur.newSpend)}
                </Text>
                <Text style={[styles.metricSub, inter18('regular'), styles.pos]}>
                  After changes
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={[styles.metricLbl, inter18('medium')]}>Saving rate</Text>
                <Text style={[styles.metricVal, inter18('semiBold')]}>
                  {cur.savingRatePct}%
                </Text>
                <Text style={[styles.metricSub, inter18('regular'), styles.pos]}>
                  Goal: {goalRate}%
                </Text>
              </View>
            </View>

            <View style={styles.goalCard}>
              <View style={styles.goalRow}>
                <Text style={[styles.goalLbl, inter18('medium')]}>Goal progress</Text>
                <Text style={[styles.goalPct, inter18('medium')]}>
                  {cur.savingRatePct} / {goalRate}%
                </Text>
              </View>
              <View style={styles.barBg}>
                <View
                  style={[styles.barFill, { width: `${progressPct}%`, backgroundColor: GREEN_BAR }]}
                />
              </View>
              <Pressable onPress={() => setSub('goals')} hitSlop={4}>
                <Text style={[styles.goalLink, inter18('regular')]}>Adjust goals →</Text>
              </Pressable>
            </View>

            <Text style={[styles.secHd, inter18('medium')]}>Recent entries</Text>
            {recent.length === 0 ? (
              <Text style={[styles.empty, inter18('regular')]}>
                No entries yet. Tap + to log your first saving.
              </Text>
            ) : (
              recent.map(e => {
                const cat = categoryById(e.categoryId);
                const saved = Math.max(0, e.oldCost - e.newCost);
                const pct =
                  e.oldCost > 0
                    ? Math.round(((e.oldCost - e.newCost) / e.oldCost) * 1000) / 10
                    : 0;
                return (
                  <View key={e.id} style={styles.row}>
                    <View style={[styles.dot, { backgroundColor: cat.color }]} />
                    <Text style={[styles.rowName, inter18('medium')]} numberOfLines={1}>
                      {e.itemName}
                    </Text>
                    <Text style={[styles.rowOld, inter18('regular')]} numberOfLines={1}>
                      ₹{formatInr(e.oldCost)}
                    </Text>
                    <Text style={[styles.rowNew, inter18('semiBold')]} numberOfLines={1}>
                      ₹{formatInr(e.newCost)}
                    </Text>
                    <View style={styles.savedPill}>
                      <Text style={[styles.savedPillText, inter18('medium')]}>
                        ₹{formatInr(saved)}
                      </Text>
                      <Text style={[styles.savedPillPct, inter18('regular')]}>{pct}%</Text>
                    </View>
                  </View>
                );
              })
            )}

            <Text style={[styles.hint, inter18('regular')]}>
              Tip: open Compare for stacked bars by category, Reports for monthly history,
              Goals for your target rate.
            </Text>
            <View style={{ height: 88 }} />
          </ScrollView>

          <Pressable
            accessibilityLabel="Add savings entry"
            onPress={() => setSub('add')}
            style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
            <PlusFab />
          </Pressable>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F7' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 16,
  },
  monthBtn: { padding: 8 },
  monthTitle: { fontSize: 15, color: '#111111', minWidth: 140, textAlign: 'center' },
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  navChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  navChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8D8D8',
  },
  navChipText: { fontSize: 13, color: ACCENT },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metric: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    padding: 10,
    minWidth: '46%',
  },
  metricLbl: { fontSize: 11, color: '#6B7280', marginBottom: 3 },
  metricVal: { fontSize: 18, color: '#111111' },
  metricSub: { fontSize: 11, marginTop: 2 },
  pos: { color: '#047857' },
  neg: { color: '#B91C1C' },
  muted: { color: '#9CA3AF' },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    padding: 12,
    marginBottom: 12,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  goalLbl: { fontSize: 11, color: '#6B7280' },
  goalPct: { fontSize: 11, color: GREEN_BAR },
  barBg: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  barFill: { height: 7, borderRadius: 4 },
  goalLink: { fontSize: 12, color: ACCENT, marginTop: 8 },
  secHd: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  empty: { fontSize: 13, color: '#6B7280', paddingVertical: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  rowName: { flex: 1, fontSize: 13, color: '#111111' },
  rowOld: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    maxWidth: 56,
  },
  rowNew: { fontSize: 13, color: '#047857', maxWidth: 64 },
  savedPill: {
    backgroundColor: '#D1FAE5',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
  },
  savedPillText: { fontSize: 10, color: '#047857' },
  savedPillPct: { fontSize: 9, color: '#065F46' },
  hint: { fontSize: 11, color: '#9CA3AF', lineHeight: 16, marginTop: 8 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fabPressed: { opacity: 0.9, transform: [{ scale: 0.96 }] },
});

export default SavingsHubScreen;

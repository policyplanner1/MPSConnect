import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalculatorHeader from '../components/CalculatorHeader';
import { categoryById } from '../constants/savingsCategories';
import type {
  CompareGranularity,
  MonthYear,
  QuarterPeriod,
  SavingsEntry,
} from '../types/savings';
import {
  buildCompareInsight,
  comparePeriods,
  monthLabel,
  quarterLabel,
} from '../utils/savingsEngine';
import { formatInr } from '../utils/formatter';
import { inter18 } from '../../../core/theme/typography';

const RED = '#F09595';
const RED_BG = '#FCEBEB';
const GREEN = '#1D9E75';
const GREEN_BG = '#E1F5EE';

type SavingsCompareScreenProps = {
  entries: SavingsEntry[];
  onBack: () => void;
};

function monthList(count: number): MonthYear[] {
  const d = new Date();
  const out: MonthYear[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push({ month: t.getMonth() + 1, year: t.getFullYear() });
  }
  return out;
}

function quarterList(count: number): QuarterPeriod[] {
  const d = new Date();
  let y = d.getFullYear();
  let q = (Math.floor(d.getMonth() / 3) + 1) as 1 | 2 | 3 | 4;
  const out: QuarterPeriod[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push({ year: y, quarter: q });
    q -= 1;
    if (q < 1) {
      q = 4;
      y -= 1;
    }
  }
  return out;
}

function yearList(count: number): number[] {
  const y = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => y - i);
}

function PickerModal({
  open,
  title,
  labels,
  values,
  selected,
  onClose,
  onSelect,
}: {
  open: boolean;
  title: string;
  labels: string[];
  values: string[];
  selected: string;
  onClose: () => void;
  onSelect: (v: string) => void;
}) {
  return (
    <Modal animationType="slide" transparent visible={open} onRequestClose={onClose}>
      <Pressable style={styles.modalBg} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
          <Text style={[styles.modalTitle, inter18('semiBold')]}>{title}</Text>
          <ScrollView style={styles.modalList}>
            {values.map((v, i) => (
              <Pressable
                key={v}
                onPress={() => onSelect(v)}
                style={[styles.modalRow, selected === v && styles.modalRowOn]}>
                <Text
                  style={[
                    styles.modalRowText,
                    inter18(selected === v ? 'semiBold' : 'regular'),
                  ]}>
                  {labels[i]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable onPress={onClose} style={styles.modalCancel}>
            <Text style={[styles.modalCancelText, inter18('medium')]}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SavingsCompareScreen({ entries, onBack }: SavingsCompareScreenProps) {
  const months = useMemo(() => monthList(24), []);
  const quarters = useMemo(() => quarterList(12), []);
  const years = useMemo(() => yearList(6), []);

  const [granularity, setGranularity] = useState<CompareGranularity>('monthly');
  const [aKey, setAKey] = useState(() => {
    const ml = monthList(24);
    const pm = ml[1] ?? ml[0];
    return `m:${pm.year}-${pm.month}`;
  });
  const [bKey, setBKey] = useState(() => {
    const d0 = new Date();
    return `m:${d0.getFullYear()}-${d0.getMonth() + 1}`;
  });
  const [picker, setPicker] = useState<'a' | 'b' | null>(null);

  const parsePeriod = (key: string): MonthYear | QuarterPeriod | { year: number } => {
    if (key.startsWith('m:')) {
      const rest = key.slice(2);
      const [ys, ms] = rest.split('-');
      return { year: parseInt(ys, 10), month: parseInt(ms, 10) };
    }
    if (key.startsWith('q:')) {
      const rest = key.slice(2);
      const [ys, qs] = rest.split('-');
      return { year: parseInt(ys, 10), quarter: parseInt(qs, 10) as 1 | 2 | 3 | 4 };
    }
    return { year: parseInt(key.slice(2), 10) };
  };

  const periodLabel = (key: string): string => {
    if (key.startsWith('m:')) {
      const rest = key.slice(2);
      const [ys, ms] = rest.split('-');
      return monthLabel({ year: parseInt(ys, 10), month: parseInt(ms, 10) });
    }
    if (key.startsWith('q:')) {
      const rest = key.slice(2);
      const [ys, qs] = rest.split('-');
      return quarterLabel({
        year: parseInt(ys, 10),
        quarter: parseInt(qs, 10) as 1 | 2 | 3 | 4,
      });
    }
    return key.slice(2);
  };

  const keysForGranularity = useMemo(() => {
    if (granularity === 'monthly') {
      return months.map(m => ({
        key: `m:${m.year}-${m.month}`,
        label: monthLabel(m),
      }));
    }
    if (granularity === 'quarterly') {
      return quarters.map(q => ({
        key: `q:${q.year}-${q.quarter}`,
        label: quarterLabel(q),
      }));
    }
    return years.map(y => ({ key: `y:${y}`, label: String(y) }));
  }, [granularity, months, quarters, years]);

  useEffect(() => {
    const keys = keysForGranularity;
    if (keys.length >= 2) {
      setBKey(keys[0].key);
      setAKey(keys[1].key);
    } else if (keys.length === 1) {
      setAKey(keys[0].key);
      setBKey(keys[0].key);
    }
  }, [granularity, keysForGranularity]);

  const { rows, insight, totalsB, maxOld, maxNew } = useMemo(() => {
    const pa = parsePeriod(aKey);
    const pb = parsePeriod(bKey);
    const { unionKeys, b } = comparePeriods(entries, granularity, pa, pb);
    const insightObj = buildCompareInsight(b);

    let totalOldB = 0;
    let totalNewB = 0;
    let maxO = 0;
    let maxN = 0;
    const rowData: {
      key: string;
      name: string;
      oldB: number;
      newB: number;
      pct: number;
    }[] = [];

    for (const cid of unionKeys) {
      const rowB = b.find(x => x.categoryId === cid);
      if (!rowB || (rowB.oldSpend === 0 && rowB.newSpend === 0)) {
        continue;
      }
      totalOldB += rowB.oldSpend;
      totalNewB += rowB.newSpend;
      maxO = Math.max(maxO, rowB.oldSpend);
      maxN = Math.max(maxN, rowB.newSpend);
      const pct =
        rowB.oldSpend > 0
          ? Math.round(((rowB.oldSpend - rowB.newSpend) / rowB.oldSpend) * 1000) / 10
          : 0;
      rowData.push({
        key: cid,
        name: categoryById(cid).name,
        oldB: rowB.oldSpend,
        newB: rowB.newSpend,
        pct,
      });
    }

    for (const r of rowData) {
      maxO = Math.max(maxO, r.oldB);
      maxN = Math.max(maxN, r.newB);
    }

    return {
      rows: rowData,
      insight: insightObj.line,
      totalsB: { old: totalOldB, new: totalNewB },
      maxOld: maxO || 1,
      maxNew: maxN || 1,
    };
  }, [entries, granularity, aKey, bKey]);

  const pickerLabels = keysForGranularity.map(k => k.label);
  const pickerValues = keysForGranularity.map(k => k.key);
  const selectedKey = picker === 'a' ? aKey : bKey;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="Compare & report" />
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.sub, inter18('regular')]}>Old cost vs new cost</Text>

        <View style={styles.granRow}>
          {(['monthly', 'quarterly', 'yearly'] as CompareGranularity[]).map(g => {
            const active = granularity === g;
            const label =
              g === 'monthly' ? 'Monthly' : g === 'quarterly' ? 'Quarterly' : 'Yearly';
            return (
              <Pressable
                key={g}
                onPress={() => setGranularity(g)}
                style={[styles.granBtn, active && styles.granBtnOn]}>
                <Text
                  style={[
                    styles.granText,
                    inter18(active ? 'semiBold' : 'regular'),
                    active && styles.granTextOn,
                  ]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.periodPick}>
          <Pressable onPress={() => setPicker('a')} style={styles.periodBox}>
            <Text style={[styles.periodLbl, inter18('regular')]}>Period A</Text>
            <Text style={[styles.periodVal, inter18('medium')]}>{periodLabel(aKey)}</Text>
          </Pressable>
          <Text style={styles.arrow}>→</Text>
          <Pressable onPress={() => setPicker('b')} style={styles.periodBox}>
            <Text style={[styles.periodLbl, inter18('regular')]}>Period B</Text>
            <Text style={[styles.periodVal, inter18('medium'), styles.periodB]}>
              {periodLabel(bKey)}
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.secHd, inter18('medium')]}>By category</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: RED }]} />
            <Text style={[styles.legendText, inter18('regular')]}>Old cost</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: GREEN }]} />
            <Text style={[styles.legendText, inter18('regular')]}>New cost</Text>
          </View>
        </View>

        {rows.map(row => (
          <View key={row.key} style={styles.cmpRow}>
            <Text style={[styles.catName, inter18('medium')]} numberOfLines={2}>
              {row.name}
            </Text>
            <View style={styles.bars}>
              <View style={[styles.track, { backgroundColor: RED_BG }]}>
                <View
                  style={[
                    styles.fill,
                    { width: `${Math.min(100, (row.oldB / maxOld) * 100)}%`, backgroundColor: RED },
                  ]}
                />
              </View>
              <View style={[styles.track, { backgroundColor: GREEN_BG }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.min(100, (row.newB / maxNew) * 100)}%`,
                      backgroundColor: GREEN,
                    },
                  ]}
                />
              </View>
              <View style={styles.vals}>
                <Text style={[styles.valOld, inter18('regular')]}>
                  ₹ {formatInr(row.oldB)}
                </Text>
                <Text style={[styles.valNew, inter18('medium')]}>
                  ₹ {formatInr(row.newB)} ({row.pct >= 0 ? '-' : '+'}
                  {Math.abs(row.pct)}%)
                </Text>
              </View>
            </View>
          </View>
        ))}

        {rows.length === 0 ? (
          <Text style={[styles.empty, inter18('regular')]}>
            No data for these periods. Add savings entries or pick different periods.
          </Text>
        ) : null}

        <View style={styles.insight}>
          <Text style={[styles.insightText, inter18('regular')]}>{insight}</Text>
        </View>

        <View style={styles.totRow}>
          <View style={styles.totCard}>
            <Text style={[styles.totLbl, inter18('medium')]}>Total old (B)</Text>
            <Text style={[styles.totVal, inter18('semiBold')]}>
              ₹ {formatInr(totalsB.old)}
            </Text>
          </View>
          <View style={styles.totCard}>
            <Text style={[styles.totLbl, inter18('medium')]}>Total new (B)</Text>
            <Text style={[styles.totValGreen, inter18('semiBold')]}>
              ₹ {formatInr(totalsB.new)}
            </Text>
          </View>
        </View>

        <View style={styles.goalHint}>
          <Text style={[styles.goalHintText, inter18('regular')]}>
            Check Goals to set your target saving rate and stay on track.
          </Text>
        </View>
      </ScrollView>

      <PickerModal
        open={picker !== null}
        title={picker === 'a' ? 'Period A' : 'Period B'}
        labels={pickerLabels}
        values={pickerValues}
        selected={selectedKey}
        onClose={() => setPicker(null)}
        onSelect={v => {
          if (picker === 'a') {
            setAKey(v);
          } else if (picker === 'b') {
            setBKey(v);
          }
          setPicker(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F7' },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },
  sub: { fontSize: 12, color: '#6B7280', paddingHorizontal: 4, marginBottom: 10 },
  granRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  granBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  granBtnOn: { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' },
  granText: { fontSize: 12, color: '#6B7280' },
  granTextOn: { color: '#2563EB' },
  periodPick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  periodBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    padding: 10,
  },
  periodLbl: { fontSize: 10, color: '#9CA3AF', marginBottom: 4 },
  periodVal: { fontSize: 14, color: '#111111' },
  periodB: { color: '#2563EB' },
  arrow: { fontSize: 16, color: '#9CA3AF' },
  secHd: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14,
    marginBottom: 8,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 10, color: '#9CA3AF' },
  cmpRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  catName: { width: 88, fontSize: 12, color: '#111111', paddingTop: 2 },
  bars: { flex: 1 },
  track: { height: 10, borderRadius: 4, marginBottom: 4, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 4 },
  vals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  valOld: { fontSize: 10, color: '#6B7280' },
  valNew: { fontSize: 10, color: GREEN },
  empty: { fontSize: 13, color: '#6B7280', textAlign: 'center', paddingVertical: 24 },
  insight: {
    backgroundColor: GREEN_BG,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  insightText: { fontSize: 13, color: '#065F46', lineHeight: 19 },
  totRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  totCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    padding: 12,
  },
  totLbl: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  totVal: { fontSize: 16, color: '#111111' },
  totValGreen: { fontSize: 16, color: GREEN },
  goalHint: { marginTop: 16, paddingHorizontal: 4 },
  goalHintText: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '55%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  modalTitle: {
    textAlign: 'center',
    paddingVertical: 14,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    color: '#111111',
  },
  modalList: { maxHeight: 320 },
  modalRow: { paddingVertical: 14, paddingHorizontal: 20 },
  modalRowOn: { backgroundColor: '#EFF6FF' },
  modalRowText: { fontSize: 15, color: '#111111' },
  modalCancel: { paddingVertical: 14, alignItems: 'center' },
  modalCancelText: { fontSize: 15, color: '#6B7280' },
});

export default SavingsCompareScreen;

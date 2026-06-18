import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalculatorHeader from '../components/CalculatorHeader';
import type { SavingsEntry } from '../types/savings';
import { aggregateMonth, monthLabel } from '../utils/savingsEngine';
import { formatInr } from '../utils/formatter';
import { inter18 } from '../../../core/theme/typography';

type SavingsReportsScreenProps = {
  entries: SavingsEntry[];
  onBack: () => void;
};

function SavingsReportsScreen({ entries, onBack }: SavingsReportsScreenProps) {
  const rows = useMemo(() => {
    const d = new Date();
    const out: { key: string; label: string; totals: ReturnType<typeof aggregateMonth> }[] =
      [];
    for (let i = 0; i < 12; i += 1) {
      const t = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const m = t.getMonth() + 1;
      const y = t.getFullYear();
      const totals = aggregateMonth(entries, m, y);
      out.push({
        key: `${y}-${m}`,
        label: monthLabel({ month: m, year: y }),
        totals,
      });
    }
    return out;
  }, [entries]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="Reports" />
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, inter18('regular')]}>
          Monthly totals include recurring entries based on their start month and
          recurrence.
        </Text>

        {rows.map(r => (
          <View key={r.key} style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={[styles.rowTitle, inter18('semiBold')]}>{r.label}</Text>
              <Text style={[styles.rowSub, inter18('regular')]}>
                Old ₹ {formatInr(r.totals.oldSpend)} → New ₹ {formatInr(r.totals.newSpend)}
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.saved, inter18('semiBold')]}>
                ₹ {formatInr(r.totals.totalSaved)}
              </Text>
              <Text style={[styles.pct, inter18('medium')]}>{r.totals.savingRatePct}%</Text>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={[styles.footerText, inter18('regular')]}>
            Use Compare to analyse two periods side by side. Set goals to stay motivated.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F7' },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },
  intro: { fontSize: 12, color: '#6B7280', lineHeight: 17, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    padding: 14,
    marginBottom: 8,
  },
  rowLeft: { flex: 1, paddingRight: 12 },
  rowTitle: { fontSize: 14, color: '#111111', marginBottom: 4 },
  rowSub: { fontSize: 11, color: '#6B7280', lineHeight: 15 },
  rowRight: { alignItems: 'flex-end' },
  saved: { fontSize: 15, color: '#0F6E56' },
  pct: { fontSize: 12, color: '#047857', marginTop: 2 },
  footer: { marginTop: 16, paddingHorizontal: 4 },
  footerText: { fontSize: 12, color: '#9CA3AF', lineHeight: 17 },
});

export default SavingsReportsScreen;

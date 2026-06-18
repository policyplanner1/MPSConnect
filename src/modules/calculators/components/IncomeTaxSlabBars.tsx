import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SlabDetail } from '../utils/incomeTaxFormula';
import { formatInr } from '../utils/formatter';
import { inter18 } from '../../../core/theme/typography';

type IncomeTaxSlabBarsProps = {
  slabs: SlabDetail[];
};

function IncomeTaxSlabBars({ slabs }: IncomeTaxSlabBarsProps) {
  const maxTaxed = Math.max(...slabs.map(s => s.taxed), 1);

  return (
    <View style={styles.wrap}>
      {slabs.map((s, i) => {
        const widthPct = Math.round((s.taxed / maxTaxed) * 100);
        return (
          <View key={`${s.label}-${i}`} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <Text style={[styles.info, inter18('regular')]} numberOfLines={2}>
              {s.label}
            </Text>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  { backgroundColor: s.color, width: `${widthPct}%` },
                ]}
              />
            </View>
            <Text style={[styles.amt, inter18('medium')]}>₹ {formatInr(s.taxed)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  info: {
    flex: 1,
    fontSize: 11,
    color: '#6B7280',
  },
  barBg: {
    width: 56,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 99,
    overflow: 'hidden',
  },
  barFill: {
    height: 5,
    borderRadius: 99,
  },
  amt: {
    fontSize: 11,
    color: '#111111',
    minWidth: 52,
    textAlign: 'right',
  },
});

export default IncomeTaxSlabBars;

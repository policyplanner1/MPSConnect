import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';

type PlannerShortcutsProps = {
  onEditIncome: () => void;
  onEditLoans: () => void;
  onRecommendations: () => void;
};

const BAR_HEIGHT = 48;

function PlannerShortcuts({
  onEditIncome,
  onEditLoans,
  onRecommendations,
}: PlannerShortcutsProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        bounces={false}
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.row}>
        <Pressable
          onPress={onEditIncome}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
          <Text style={[styles.chipText, inter18('medium')]}>Income</Text>
        </Pressable>
        <Pressable
          onPress={onEditLoans}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
          <Text style={[styles.chipText, inter18('medium')]}>Loans & EMI</Text>
        </Pressable>
        <Pressable
          onPress={onRecommendations}
          style={({ pressed }) => [styles.chip, styles.chipMuted, pressed && styles.chipPressed]}>
          <Text style={[styles.chipTextMuted, inter18('medium')]}>Recommendations</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 0,
    flexShrink: 0,
    height: BAR_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scroll: {
    flexGrow: 0,
    height: BAR_HEIGHT,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    height: BAR_HEIGHT,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
  },
  chipMuted: {
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  chipPressed: { opacity: 0.85 },
  chipText: { fontSize: 13, color: '#2563EB' },
  chipTextMuted: { fontSize: 13, color: '#4B5563' },
});

export default PlannerShortcuts;

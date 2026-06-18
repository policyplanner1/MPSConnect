import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';

export type PlannerMainTab = 'snapshot' | 'expenses';

type PlannerBottomTabsProps = {
  active: PlannerMainTab;
  onChange: (tab: PlannerMainTab) => void;
};

function PlannerBottomTabs({ active, onChange }: PlannerBottomTabsProps) {
  return (
    <View style={styles.bar}>
      <Pressable
        onPress={() => onChange('snapshot')}
        style={[styles.tab, active === 'snapshot' && styles.tabActive]}>
        <Text
          style={[
            styles.tabText,
            inter18(active === 'snapshot' ? 'semiBold' : 'regular'),
            active === 'snapshot' && styles.tabTextActive,
          ]}>
          Snapshot
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('expenses')}
        style={[styles.tab, active === 'expenses' && styles.tabActive]}>
        <Text
          style={[
            styles.tabText,
            inter18(active === 'expenses' ? 'semiBold' : 'regular'),
            active === 'expenses' && styles.tabTextActive,
          ]}>
          Expenses
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderTopWidth: 2,
    borderTopColor: '#2563EB',
    marginTop: -1,
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#2563EB',
  },
});

export default PlannerBottomTabs;

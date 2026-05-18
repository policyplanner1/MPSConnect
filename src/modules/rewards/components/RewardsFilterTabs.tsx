import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { inter18 } from '../../../core/theme/typography';
import {
  REWARD_FILTER_LABELS,
  REWARD_TRANSACTION_FILTERS,
} from '../store/RewardsStore';

type RewardTransactionFilter =
  (typeof REWARD_TRANSACTION_FILTERS)[number];

type RewardsFilterTabsProps = {
  activeFilter: RewardTransactionFilter;
  onFilterChange: (filter: RewardTransactionFilter) => void;
};

function RewardsFilterTabs({
  activeFilter,
  onFilterChange,
}: RewardsFilterTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {REWARD_TRANSACTION_FILTERS.map(filter => {
        const isActive = filter === activeFilter;

        return (
          <Pressable
            key={filter}
            onPress={() => onFilterChange(filter)}
            style={[styles.tab, isActive ? styles.tabActive : undefined]}>
            <Text
              style={[
                styles.tabText,
                inter18(isActive ? 'semiBold' : 'regular'),
                isActive ? styles.tabTextActive : undefined,
              ]}>
              {REWARD_FILTER_LABELS[filter]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 4,
  },
  tab: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8D2EA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabActive: {
    borderColor: '#6B4EFF',
    backgroundColor: '#F3EEFF',
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#6B4EFF',
  },
});

export default RewardsFilterTabs;

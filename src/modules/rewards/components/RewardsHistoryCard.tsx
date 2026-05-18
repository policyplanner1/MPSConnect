import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';
import {
  formatRewardAmount,
  rewardAmountColor,
} from '../store/RewardsStore';

export type RewardsHistoryCardProps = {
  dateLabel: string;
  yearLabel: string;
  title: string;
  subtitle: string;
  amount: number;
};

function RewardsHistoryCard({
  dateLabel,
  yearLabel,
  title,
  subtitle,
  amount,
}: RewardsHistoryCardProps) {
  const amountColor = rewardAmountColor(amount);

  return (
    <View style={styles.card}>
      <View style={styles.dateCol}>
        <Text style={[styles.dateText, inter18('medium')]}>{dateLabel}</Text>
        <Text style={[styles.yearText, inter18('regular')]}>{yearLabel}</Text>
      </View>

      <View style={styles.contentCol}>
        <Text style={[styles.title, inter18('bold')]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.subtitle, inter18('regular')]} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.amountCol}>
        <Text style={styles.star}>⭐</Text>
        <Text style={[styles.amount, inter18('bold'), { color: amountColor }]}>
          {formatRewardAmount(amount)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECE7F8',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 10,
  },
  dateCol: {
    width: 52,
  },
  dateText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 14,
  },
  yearText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  contentCol: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    color: '#111111',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 15,
  },
  amountCol: {
    alignItems: 'flex-end',
    minWidth: 58,
  },
  star: {
    fontSize: 12,
    marginBottom: 4,
  },
  amount: {
    fontSize: 13,
  },
});

export default RewardsHistoryCard;

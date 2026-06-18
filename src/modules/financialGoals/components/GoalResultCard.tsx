import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';

type GoalResultCardProps = {
  step: string;
  title: string;
  subtitle: string;
  amount: string;
  accent: string;
};

export default function GoalResultCard({
  step,
  title,
  subtitle,
  amount,
  accent,
}: GoalResultCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: accent }]}>
      <View style={styles.header}>
        <View style={[styles.stepBadge, { backgroundColor: accent }]}>
          <Text style={[styles.stepText, inter18('bold')]}>{step}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, inter18('semiBold')]}>{title}</Text>
          <Text style={[styles.subtitle, inter18('regular')]}>{subtitle}</Text>
        </View>
      </View>
      <Text style={[styles.amount, inter18('bold')]}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  amount: {
    fontSize: 24,
    color: '#111827',
  },
});

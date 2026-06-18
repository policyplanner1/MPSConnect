import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { TodoPriority } from '../types/todo';
import { inter18 } from '../../../core/theme/typography';

const PRIORITY_CONFIG: Record<
  TodoPriority,
  { label: string; bg: string; color: string; border: string }
> = {
  high: {
    label: 'High',
    bg: '#FEE2E2',
    color: '#B91C1C',
    border: '#FECACA',
  },
  medium: {
    label: 'Medium',
    bg: '#FEF3C7',
    color: '#B45309',
    border: '#FDE68A',
  },
  low: {
    label: 'Low',
    bg: '#D1FAE5',
    color: '#047857',
    border: '#A7F3D0',
  },
};

type TodoPriorityBadgeProps = {
  priority: TodoPriority;
};

function TodoPriorityBadge({ priority }: TodoPriorityBadgeProps) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <View
      style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}
      accessibilityLabel={`Priority: ${cfg.label}`}>
      <Text style={[styles.text, inter18('medium'), { color: cfg.color }]}>
        {cfg.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    fontSize: 10,
  },
});

export default TodoPriorityBadge;

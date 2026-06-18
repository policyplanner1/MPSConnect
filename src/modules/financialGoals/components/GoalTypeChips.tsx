import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';
import type { GoalTypeId, GoalTypeOption } from '../constants/goalOptions';

type GoalTypeChipsProps = {
  options: GoalTypeOption[];
  selectedId: GoalTypeId;
  onSelect: (option: GoalTypeOption) => void;
};

export default function GoalTypeChips({ options, selectedId, onSelect }: GoalTypeChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      {options.map(option => {
        const active = option.id === selectedId;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option)}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && { opacity: 0.9 },
            ]}>
            <Text style={styles.emoji}>{option.emoji}</Text>
            <Text
              style={[
                styles.label,
                inter18(active ? 'semiBold' : 'regular'),
                active && styles.labelActive,
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
      <View style={styles.trail} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    gap: 8,
  },
  trail: {
    width: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#5E02AF',
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    fontSize: 13,
    color: '#374151',
  },
  labelActive: {
    color: '#5E02AF',
  },
});

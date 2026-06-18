import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';
import type { GoalTypeOption } from '../constants/goalOptions';

type GoalChooseCardProps = {
  option: GoalTypeOption;
  selected: boolean;
  onPress: () => void;
};

export default function GoalChooseCard({ option, selected, onPress }: GoalChooseCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && { opacity: 0.92 },
      ]}>
      <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
        <Text style={styles.emoji}>{option.emoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, inter18(selected ? 'bold' : 'semiBold')]}>{option.label}</Text>
        <Text style={[styles.desc, inter18('regular')]}>{option.description}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  cardSelected: {
    borderColor: '#5E02AF',
    backgroundColor: '#FAF5FF',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSelected: {
    backgroundColor: '#EDE9FE',
  },
  emoji: {
    fontSize: 24,
  },
  body: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  title: {
    fontSize: 15,
    color: '#111827',
  },
  desc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  radioSelected: {
    borderColor: '#5E02AF',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5E02AF',
  },
});

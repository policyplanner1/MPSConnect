import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

type RefereAndEarnCardProps = {
  totalEarnedRupees: number;
  onPress?: () => void;
};

function ChevronIcon() {
  return (
    <Svg height={14} viewBox="0 0 24 24" width={14}>
      <Path
        d="M9 6L15 12L9 18"
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.4}
      />
    </Svg>
  );
}

function RefereAndEarnCard({ totalEarnedRupees, onPress }: RefereAndEarnCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.starEmoji}>⭐</Text>
      <View style={styles.copy}>
        <Text style={[styles.label, inter18('regular')]}>Total Earned</Text>
        <Text style={[styles.amount, inter18('bold')]}>₹{totalEarnedRupees}</Text>
      </View>
      <View style={styles.chevronButton}>
        <ChevronIcon />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  starEmoji: {
    fontSize: 34,
  },
  copy: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  amount: {
    fontSize: 28,
    color: '#1F2937',
  },
  chevronButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#6B4EFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RefereAndEarnCard;

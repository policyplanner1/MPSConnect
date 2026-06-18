import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { RecommendationItem } from '../types/financialPlanner';
import { inter18 } from '../../../core/theme/typography';

function ChevronIcon() {
  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Path
        d="M9 6L15 12L9 18"
        fill="none"
        stroke="#9CA3AF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

function RecIcon({ id, color }: { id: RecommendationItem['id']; color: string }) {
  if (id === 'sip') {
    return (
      <Svg height={22} viewBox="0 0 24 24" width={22}>
        <Path d="M4 18V6M8 18v-4M12 18V10M16 18V8M20 18V4" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Path d="M18 6l2-2 2 2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  if (id === 'insurance') {
    return (
      <Svg height={22} viewBox="0 0 24 24" width={22}>
        <Path
          d="M12 3L4 7v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V7l-8-4z"
          fill="none"
          stroke={color}
          strokeWidth={2}
        />
        <Path d="M12 11v4M12 9h.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }
  if (id === 'tax') {
    return (
      <Svg height={22} viewBox="0 0 24 24" width={22}>
        <Rect fill="none" height={14} rx={2} stroke={color} strokeWidth={2} width={16} x={4} y={5} />
        <Path d="M8 10h8M8 14h5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg height={22} viewBox="0 0 24 24" width={22}>
      <Path
        d="M4 8h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
      <Circle cx={12} cy={13} fill={color} r={2} />
    </Svg>
  );
}

type RecommendationCardProps = {
  item: RecommendationItem;
  onPress?: () => void;
};

function RecommendationCard({ item, onPress }: RecommendationCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
        <RecIcon color={item.iconColor} id={item.id} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, inter18('bold')]}>{item.title}</Text>
        <Text style={[styles.desc, inter18('regular')]}>{item.description}</Text>
      </View>
      <ChevronIcon />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 12,
  },
  cardPressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    color: '#111111',
  },
  desc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },
});

export default RecommendationCard;

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

type ServicesSectionCardProps = {
  title: string;
  children: React.ReactNode;
  onHeaderPress?: () => void;
  rightChevron?: boolean;
};

function ChevronIcon() {
  return (
    <Svg height={22} viewBox="0 0 24 24" width={22}>
      <Path
        d="M9 6L15 12L9 18"
        fill="none"
        stroke="#111111"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.6}
      />
    </Svg>
  );
}

export default function ServicesSectionCard({
  title,
  children,
  onHeaderPress,
  rightChevron = false,
}: ServicesSectionCardProps) {
  return (
    <View style={styles.card}>
      <Pressable
        disabled={!onHeaderPress}
        onPress={onHeaderPress}
        style={styles.header}>
        <Text style={[styles.title, inter18('bold')]}>{title}</Text>
        {rightChevron ? <ChevronIcon /> : null}
      </Pressable>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 12,
    color: '#1E3A5F',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  body: {
    paddingBottom: 12,
  },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

type NotificationHeaderProps = {
  onBack?: () => void;
  onFilterPress?: () => void;
};

function BackArrowIcon() {
  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Path
        d="M15 5L8 12L15 19"
        fill="none"
        stroke="#111111"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

function FilterIcon() {
  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Path
        d="M4 7H20M7 12H17M10 17H14"
        fill="none"
        stroke="#111111"
        strokeLinecap="round"
        strokeWidth={1.8}
      />
    </Svg>
  );
}

function NotificationHeader({ onBack, onFilterPress }: NotificationHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable hitSlop={10} onPress={onBack} style={styles.sideButton}>
        <BackArrowIcon />
      </Pressable>

      <Text style={[styles.title, inter18('bold')]}>Notifications</Text>

      <Pressable hitSlop={10} onPress={onFilterPress} style={styles.sideButton}>
        <FilterIcon />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: '#FAFAFA',
  },
  sideButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    color: '#111111',
    letterSpacing: -0.2,
  },
});

export default NotificationHeader;

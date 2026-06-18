import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

type CalculatorHeaderProps = {
  title: string;
  onBack?: () => void;
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

function CalculatorHeader({ title, onBack }: CalculatorHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable hitSlop={10} onPress={onBack} style={styles.side}>
        <BackArrowIcon />
      </Pressable>
      <Text style={[styles.title, inter18('bold')]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  side: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    color: '#111111',
  },
});

export default CalculatorHeader;

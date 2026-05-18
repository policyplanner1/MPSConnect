import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

type RewardsHeaderProps = {
  title: string;
  onBack?: () => void;
  light?: boolean;
};

function BackArrowIcon({ light = false }: { light?: boolean }) {
  const stroke = light ? '#FFFFFF' : '#111111';

  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Path
        d="M15 5L8 12L15 19"
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

function RewardsHeader({ title, onBack, light = false }: RewardsHeaderProps) {
  return (
    <View style={[styles.header, light ? styles.headerLight : undefined]}>
      <Pressable hitSlop={10} onPress={onBack} style={styles.sideButton}>
        <BackArrowIcon light={light} />
      </Pressable>

      <Text
        style={[
          styles.title,
          inter18('bold'),
          light ? styles.titleLight : undefined,
        ]}>
        {title}
      </Text>

      <View style={styles.sideButton} />
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
    backgroundColor: '#F3EEFF',
  },
  headerLight: {
    backgroundColor: 'transparent',
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
  titleLight: {
    color: '#FFFFFF',
  },
});

export default RewardsHeader;

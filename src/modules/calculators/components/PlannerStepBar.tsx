import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

type PlannerStepBarProps = {
  step: number;
  totalSteps?: number;
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

function PlannerStepBar({ step, totalSteps = 3, onBack }: PlannerStepBarProps) {
  return (
    <View style={styles.bar}>
      <Pressable hitSlop={10} onPress={onBack} style={styles.backBtn}>
        <BackArrowIcon />
      </Pressable>
      <Text style={[styles.stepText, inter18('semiBold')]}>
        Step {step} of {totalSteps}
      </Text>
      <View style={styles.backBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 14,
    color: '#2563EB',
  },
});

export default PlannerStepBar;

import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

type GradientSubmitButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function GradientSubmitButton({
  title,
  onPress,
  disabled,
  loading,
}: GradientSubmitButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.outer,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading ? { opacity: 0.92 } : null,
      ]}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="cancelRequestSubmitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#9E8DFF" />
            <Stop offset="100%" stopColor="#5E02AF" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height={52} rx={12} fill="url(#cancelRequestSubmitGrad)" />
      </Svg>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" style={styles.spinner} />
      ) : (
        <Text style={[styles.text, inter18('bold')]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignSelf: 'stretch',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#5E02AF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  disabled: { opacity: 0.55 },
  text: { color: '#FFFFFF', fontSize: 16, zIndex: 1 },
  spinner: { zIndex: 1 },
});

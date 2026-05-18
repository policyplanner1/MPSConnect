import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { inter18 } from '../../../core/theme/typography';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

function AuthButton({ label, onPress, disabled = false }: AuthButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled ? styles.buttonDisabled : undefined]}>
      <Svg height="100%" style={StyleSheet.absoluteFill} width="100%">
        <Defs>
          <LinearGradient id="authButtonGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <Stop offset="0%" stopColor="#802091" />
            <Stop offset="100%" stopColor="#005A82" />
          </LinearGradient>
        </Defs>
        <Rect
          fill="url(#authButtonGradient)"
          height="100%"
          rx="26"
          ry="26"
          width="100%"
          x="0"
          y="0"
        />
      </Svg>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    ...inter18('bold'),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default AuthButton;

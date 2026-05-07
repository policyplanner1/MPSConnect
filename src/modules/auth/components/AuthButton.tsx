import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
};

function AuthButton({ label, onPress }: AuthButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Svg height="100%" style={StyleSheet.absoluteFill} width="100%">
        <Defs>
          <LinearGradient id="authButtonGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <Stop offset="0%" stopColor="#6A1B9A" />
            <Stop offset="100%" stopColor="#006488" />
          </LinearGradient>
        </Defs>
        <Rect
          fill="url(#authButtonGradient)"
          height="100%"
          rx="10"
          ry="10"
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
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default AuthButton;

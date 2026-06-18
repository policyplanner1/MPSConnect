import React, { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

function CalculatorHomeBackground({ children }: PropsWithChildren) {
  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id="calcHomeBg" x1="0%" x2="0%" y1="0%" y2="100%">
              <Stop offset="0%" stopColor="#EEF2FF" />
              <Stop offset="50%" stopColor="#F3F4F6" />
              <Stop offset="100%" stopColor="#E0E7FF" />
            </LinearGradient>
          </Defs>
          <Rect fill="url(#calcHomeBg)" height="100%" width="100%" x="0" y="0" />
        </Svg>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default CalculatorHomeBackground;

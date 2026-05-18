import React, { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type AuthBackgroundProps = PropsWithChildren<{
  variant?: 'soft' | 'brand';
}>;

function AuthBackground({
  children,
  variant = 'soft',
}: AuthBackgroundProps) {
  const isBrand = variant === 'brand';

  return (
    <SafeAreaView
      style={[styles.safeArea, isBrand ? styles.brandSafeArea : undefined]}>
      <View style={styles.container}>
        <View pointerEvents="none" style={styles.backgroundLayer}>
          <Svg height="100%" width="100%">
            <Defs>
              <LinearGradient id="authBrandGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <Stop offset="0%" stopColor="#006488" />
                <Stop offset="100%" stopColor="#6A1B9A" />
              </LinearGradient>
              <LinearGradient id="authSoftGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <Stop offset="0%" stopColor="#EEDBFF" />
                <Stop offset="40%" stopColor="#EFE4FF" />
                <Stop offset="100%" stopColor="#DDEBFF" />
              </LinearGradient>
            </Defs>

            <Rect
              fill={`url(#${isBrand ? 'authBrandGradient' : 'authSoftGradient'})`}
              height="100%"
              width="100%"
              x="0"
              y="0"
            />
          </Svg>
        </View>

        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEDBFF',
  },
  brandSafeArea: {
    backgroundColor: '#006488',
  },
  container: {
    flex: 1,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    flex: 1,
  },
});

export default AuthBackground;

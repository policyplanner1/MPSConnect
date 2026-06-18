import React from 'react';
import { Pressable, PressableProps, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

type BundleButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  price: string;
  originalPrice?: string;
};

function BundleButton({ label, price, originalPrice, ...rest }: BundleButtonProps) {
  return (
    <Pressable
      android_ripple={{ color: 'rgba(255,255,255,0.18)' }}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      {...rest}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id="bundleGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#9581F1" />
              <Stop offset="1" stopColor="#552389" />
            </LinearGradient>
          </Defs>
          <Rect fill="url(#bundleGrad)" height="100%" rx={10} width="100%" />
        </Svg>
      </View>

      <Text style={styles.label}>
        {label}{' '}
        <Text style={styles.price}>{price}</Text>
        {originalPrice != null && (
          <>
            {' '}
            <Text style={styles.originalPrice}>{originalPrice}</Text>
          </>
        )}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.88,
  },
  label: {
    fontSize: 13,
    ...inter18('bold'),
    color: '#FFFFFF',
    textAlign: 'center',
  },
  price: {
    ...inter18('bold'),
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    ...inter18('regular'),
    opacity: 0.78,
  },
});

export type { BundleButtonProps };
export default BundleButton;

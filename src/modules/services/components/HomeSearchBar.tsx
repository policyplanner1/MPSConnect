import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

const ROTATING_SERVICES = ['"Tax Filing"', '"Aadhaar Card"', '"PAN Card"', '"Passport"', '"Rent Agreement"', '"Driving License"', '"Health Insurance"'];
const LINE_HEIGHT = 22;
const ROTATE_INTERVAL_MS = 2800;
const ANIMATION_MS = 550;

function SearchIcon() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Circle cx="11" cy="11" fill="none" r="7" stroke="#9CA3AF" strokeWidth="1.8" />
      <Path
        d="M20 20L16.5 16.5"
        fill="none"
        stroke="#9CA3AF"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </Svg>
  );
}

type HomeSearchBarProps = {
  onPress?: () => void;
  compact?: boolean;
};

export default function HomeSearchBar({ onPress, compact = false }: HomeSearchBarProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const indexRef = useRef(0);
  const loopItems = [...ROTATING_SERVICES, ROTATING_SERVICES[0]];

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = indexRef.current + 1;

      Animated.timing(translateY, {
        toValue: -nextIndex * LINE_HEIGHT,
        duration: ANIMATION_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) {
          return;
        }
        if (nextIndex >= ROTATING_SERVICES.length) {
          translateY.setValue(0);
          indexRef.current = 0;
        } else {
          indexRef.current = nextIndex;
        }
      });
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [translateY]);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel="Search services"
      style={({ pressed }) => [styles.bar, compact && styles.barCompact, pressed && styles.barPressed]}>
      <SearchIcon />
      <View style={styles.placeholderRow}>
        <Text style={[styles.staticText, inter18('regular')]}>Search </Text>
        <View style={styles.clip}>
          <Animated.View style={{ transform: [{ translateY }] }}>
            {loopItems.map((item, index) => (
              <Text
                key={`${item}-${index}`}
                style={[styles.rotatingText, inter18('regular'), { height: LINE_HEIGHT, lineHeight: LINE_HEIGHT }]}>
                {item}
              </Text>
            ))}
          </Animated.View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  barCompact: {
    marginBottom: 0,
  },
  barPressed: {
    opacity: 0.94,
  },
  placeholderRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  staticText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  clip: {
    height: LINE_HEIGHT,
    overflow: 'hidden',
  },
  rotatingText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import ExclusiveImage from '../../../assets/images/exclusive_image.svg';
import MoneyImage from '../../../assets/images/money_imge.svg';

import { inter18 } from '../../../core/theme/typography';

type BundleCardProps = {
  highlightText: string;
  titleSuffix: string;
  subtitle: string;
};

function BundleCard({
  highlightText,
  titleSuffix,
  subtitle,
}: BundleCardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg height="100%" width="100%">
            <Defs>
              <LinearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#9581F1" />
                <Stop offset="1" stopColor="#552389" />
              </LinearGradient>
            </Defs>
            <Rect fill="url(#cardGrad)" height="100%" rx={14} width="100%" />
          </Svg>
        </View>

        <MoneyImage height={56} style={styles.moneyImage} width={56} />

        <View style={styles.content}>
          <Text style={styles.title}>
            <Text style={styles.highlight}>{highlightText}</Text>
            <Text>{titleSuffix}</Text>
          </Text>
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        </View>
      </View>

      <ExclusiveImage height={102} style={styles.badge} width={74} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    paddingTop: 6,
    marginHorizontal: 6,
    overflow: 'visible',
  },
  card: {
    minHeight: 68,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  moneyImage: {
    position: 'absolute',
    left: -14,
    bottom: -8,
  },
  content: {
    flex: 1,
    marginLeft: 54,
    marginRight: 48,
    paddingVertical: 11,
  },
  title: {
    fontSize: 13.5,
    lineHeight: 18,
    ...inter18('regular'),
    color: '#FFFFFF',
  },
  highlight: {
    ...inter18('bold'),
  },
  subtitle: {
    marginTop: 2,
    fontSize: 9.5,
    lineHeight: 13,
    color: '#F4E8FF',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 4,
  },
});

export type { BundleCardProps };
export default BundleCard;

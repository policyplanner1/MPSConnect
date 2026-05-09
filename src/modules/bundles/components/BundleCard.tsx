import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ExclusiveImage from '../../../assets/images/exclusive_image.svg';
import MoneyImage from '../../../assets/images/money_imge.svg';

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
    backgroundColor: '#5B2796',
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
    fontWeight: '400',
    color: '#FFFFFF',
  },
  highlight: {
    fontWeight: '800',
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

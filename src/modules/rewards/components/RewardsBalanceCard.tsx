import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

type RewardsBalanceCardProps = {
  coins: number;
  expiringCoins: number;
  expiryDate: string;
  conversionLabel: string;
};

function WarningIcon() {
  return (
    <View style={styles.warningIcon}>
      <Text style={styles.warningMark}>!</Text>
    </View>
  );
}

function RewardsBalanceCard({
  coins,
  expiringCoins,
  expiryDate,
  conversionLabel,
}: RewardsBalanceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.gradientWrap}>
        <Svg height="100%" style={StyleSheet.absoluteFill} width="100%">
          <Defs>
            <LinearGradient id="balanceGrad" x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0" stopColor="#6B4EFF" />
              <Stop offset="1" stopColor="#8B6CFF" />
            </LinearGradient>
          </Defs>
          <Rect fill="url(#balanceGrad)" height="100%" width="100%" />
        </Svg>

        <View style={styles.topSection}>
          <Text style={styles.starEmoji}>⭐</Text>
          <View style={styles.balanceCopy}>
            <Text style={[styles.balanceLabel, inter18('medium')]}>My Balance</Text>
            <Text style={[styles.balanceValue, inter18('bold')]}>{coins} Coins</Text>
          </View>
          <View style={styles.ratePill}>
            <Text style={[styles.rateText, inter18('medium')]}>{conversionLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.expiringLeft}>
          <WarningIcon />
          <Text style={[styles.expiringText, inter18('medium')]}>
            {expiringCoins} Coins Expiring
          </Text>
        </View>
        <Text style={[styles.expiryDate, inter18('regular')]}>Expiry: {expiryDate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E9E2FF',
  },
  gradientWrap: {
    minHeight: 118,
    paddingHorizontal: 16,
    paddingVertical: 16,
    overflow: 'hidden',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starEmoji: {
    fontSize: 42,
    lineHeight: 46,
  },
  balanceCopy: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  ratePill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rateText: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DDD2FF',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  expiringLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  warningIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: -1,
  },
  expiringText: {
    fontSize: 12,
    color: '#4C1D95',
  },
  expiryDate: {
    fontSize: 11,
    color: '#5B21B6',
  },
});

export default RewardsBalanceCard;

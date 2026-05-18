import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

type RewardsReferralBannerProps = {
  onReferNow?: () => void;
};

function RewardsReferralBanner({ onReferNow }: RewardsReferralBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id="referBannerGrad" x1="0" x2="1" y1="0" y2="1">
              <Stop offset="0" stopColor="#FFE08A" />
              <Stop offset="1" stopColor="#FFC94A" />
            </LinearGradient>
          </Defs>
          <Rect fill="url(#referBannerGrad)" height="100%" width="100%" rx={16} />
        </Svg>
      </View>

      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={[styles.title, inter18('bold')]}>Earn More with Friends!</Text>
          <Text style={[styles.body, inter18('regular')]}>
            Invite friends to use our services & earn exciting rewards for every
            successful referral.
          </Text>
          <Pressable onPress={onReferNow} style={styles.button}>
            <Text style={[styles.buttonText, inter18('bold')]}>Refer now</Text>
          </Pressable>
        </View>
        <Text style={styles.bigStar}>⭐</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 150,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    color: '#3F2A00',
    marginBottom: 6,
  },
  body: {
    fontSize: 11,
    color: '#5C4A1A',
    lineHeight: 16,
    marginBottom: 12,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#8B5E2B',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  bigStar: {
    fontSize: 52,
    lineHeight: 56,
  },
});

export default RewardsReferralBanner;

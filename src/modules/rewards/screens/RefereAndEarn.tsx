import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import RewardsHeader from '../components/RewardsHeader';
import RefereAndEarnCard from '../components/RefereAndEarnCard';
import { REWARD_BALANCE } from '../services/rewards.service';
import { inter18 } from '../../../core/theme/typography';

type RefereAndEarnProps = {
  onBack?: () => void;
};

const REFERRAL_RULES = [
  {
    title: 'Reward Eligibility:',
    body: 'Only registered users can refer friends. Referrals must be new users who have not signed up before.',
  },
  {
    title: 'Reward Expiry:',
    body: 'Rewards must be used within the specified period (e.g., 90 days) from the date they are credited.',
  },
];

function ShareIcon() {
  return (
    <Svg height={22} viewBox="0 0 24 24" width={22}>
      <Path
        d="M12 4V16M12 4L8 8M12 4L16 8M6 12V18C6 19.1 6.9 20 8 20H16C17.1 20 18 19.1 18 18V12"
        fill="none"
        stroke="#6B4EFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </Svg>
  );
}

function RefereAndEarn({ onBack }: RefereAndEarnProps) {
  const [copied, setCopied] = useState(false);
  const referralCode = REWARD_BALANCE.referralCode;

  const handleCopyCode = async () => {
    setCopied(true);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Referral code copied', ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied', referralCode);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join MPS Connect with my referral code: ${referralCode}`,
      });
    } catch {
      // User dismissed share sheet
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.background}>
        <Svg height="100%" style={StyleSheet.absoluteFill} width="100%">
          <Defs>
            <LinearGradient id="referGrad" x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0" stopColor="#5E02AF" />
              <Stop offset="1" stopColor="#8B5CF6" />
            </LinearGradient>
          </Defs>
          <Rect fill="url(#referGrad)" height="100%" width="100%" />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <RewardsHeader light onBack={onBack} title="Refer and earn" />

        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.heroStars}>
            <Text style={styles.heroStarSmall}>✨</Text>
            <Text style={styles.heroStarMain}>⭐</Text>
            <Text style={styles.heroStarSmallRight}>✨</Text>
          </View>

          <RefereAndEarnCard totalEarnedRupees={REWARD_BALANCE.totalEarnedRupees} />

          <View style={styles.rulesCard}>
            <Text style={[styles.rulesTitle, inter18('bold')]}>
              Refer & Earn Program Rules
            </Text>

            {REFERRAL_RULES.map(rule => (
              <View key={rule.title} style={styles.ruleRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={[styles.ruleText, inter18('regular')]}>
                  <Text style={inter18('bold')}>{rule.title} </Text>
                  {rule.body}
                </Text>
              </View>
            ))}

            <View style={styles.codeRow}>
              <Pressable onPress={handleCopyCode} style={styles.codeButton}>
                <Text style={[styles.codeText, inter18('bold')]}>{referralCode}</Text>
              </Pressable>

              <Pressable onPress={handleShare} style={styles.shareButton}>
                <ShareIcon />
              </Pressable>
            </View>

            <Text style={[styles.copyHint, inter18('regular')]}>
              {copied ? 'Copied!' : 'Click to copy'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFill,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 16,
  },
  heroStars: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    marginBottom: 4,
  },
  heroStarMain: {
    fontSize: 88,
    lineHeight: 96,
  },
  heroStarSmall: {
    position: 'absolute',
    left: 48,
    top: 28,
    fontSize: 28,
    opacity: 0.85,
  },
  heroStarSmallRight: {
    position: 'absolute',
    right: 52,
    top: 36,
    fontSize: 24,
    opacity: 0.85,
  },
  rulesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
  },
  rulesTitle: {
    fontSize: 16,
    color: '#111111',
    marginBottom: 14,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 20,
  },
  ruleText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 19,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  codeButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B4EFF',
  },
  codeText: {
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  shareButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#6B4EFF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyHint: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    color: '#C4B5FD',
  },
});

export default RefereAndEarn;

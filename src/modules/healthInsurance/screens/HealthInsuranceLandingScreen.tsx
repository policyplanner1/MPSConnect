import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const SERVICE_IMAGE =
  'https://cdn.rewardplanners.com/public/services/12/service-1778820937088-kwgpdn.png';

const FEATURES = [
  { icon: '🛡️', label: 'Quick Coverage', desc: 'Get insured within 24 hours' },
  { icon: '👨‍⚕️', label: 'Expert Guidance', desc: 'Dedicated health advisors' },
  { icon: '📋', label: 'Hassle-Free Claims', desc: 'Cashless at 10,000+ hospitals' },
  { icon: '💰', label: 'Best Premiums', desc: 'Compare & save up to 40%' },
];

type Props = {
  onBack: () => void;
  onEnquiry: () => void;
  onGetQuote: () => void;
};

function BackIcon() {
  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Path
        d="M15 18L9 12L15 6"
        fill="none"
        stroke="#1A5C35"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
    </Svg>
  );
}

function HealthInsuranceLandingScreen({ onBack, onEnquiry, onGetQuote }: Props) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
            <BackIcon />
          </Pressable>
          <Text style={styles.headerTitle}>Health Insurance</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTag}>INSURANCE</Text>
            <Text style={styles.heroTitle}>Health{'\n'}Insurance</Text>
            <Text style={styles.heroSub}>
              Clear guidance to help you make informed health coverage decisions
            </Text>
            <Text style={styles.heroPrice}>Starting from <Text style={styles.heroPriceVal}>₹600/yr</Text></Text>
          </View>
          <Image
            source={{ uri: SERVICE_IMAGE }}
            style={styles.heroImg}
            resizeMode="contain"
          />
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={onEnquiry}
            style={({ pressed }) => [styles.actionBtn, styles.actionBtnOutline, pressed && styles.pressed]}>
            <Text style={styles.actionBtnOutlineText}>Get Enquiry</Text>
          </Pressable>
          <Pressable
            onPress={onGetQuote}
            style={({ pressed }) => [styles.actionBtn, styles.actionBtnFill, pressed && styles.pressed]}>
            <Text style={styles.actionBtnFillText}>Get a Quote</Text>
          </Pressable>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>
          <View style={styles.featureGrid}>
            {FEATURES.map(f => (
              <View key={f.label} style={styles.featureCard}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* What's covered */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Covered?</Text>
          {[
            'Hospitalisation expenses (pre & post)',
            'Day care procedures',
            'Ambulance charges',
            'Organ donor expenses',
            'Mental illness treatment',
            'AYUSH treatment',
          ].map(item => (
            <View key={item} style={styles.coverRow}>
              <View style={styles.coverDot} />
              <Text style={styles.coverText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* CTA strip */}
        <Pressable
          onPress={onGetQuote}
          style={({ pressed }) => [styles.ctaStrip, pressed && styles.pressed]}>
          <Text style={styles.ctaText}>Compare Plans & Get Your Quote →</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F4F4' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#14532D',
  },
  headerSpacer: { width: 34 },

  hero: {
    backgroundColor: '#E8F5E0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 4,
  },
  heroTextWrap: { flex: 1, paddingRight: 8 },
  heroTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2D6A4F',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#14532D',
    lineHeight: 36,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 19,
    marginBottom: 12,
  },
  heroPrice: { fontSize: 13, color: '#555555' },
  heroPriceVal: { fontWeight: '700', color: '#14532D' },
  heroImg: { width: 120, height: 120 },

  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnOutline: {
    borderWidth: 2,
    borderColor: '#14532D',
  },
  actionBtnFill: {
    backgroundColor: '#6B21A8',
  },
  actionBtnOutlineText: {
    color: '#14532D',
    fontWeight: '700',
    fontSize: 14,
  },
  actionBtnFillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  pressed: { opacity: 0.8 },

  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 16,
  },

  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  featureIcon: { fontSize: 22, marginBottom: 8 },
  featureLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 4,
  },
  featureDesc: { fontSize: 11, color: '#666666', lineHeight: 16 },

  coverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  coverDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 12,
  },
  coverText: { fontSize: 14, color: '#374151' },

  ctaStrip: {
    backgroundColor: '#6B21A8',
    margin: 16,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 32,
  },
  ctaText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});

export default HealthInsuranceLandingScreen;

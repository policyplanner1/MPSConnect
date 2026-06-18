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

import { Service } from '../../services/types/service.types';

import { inter18 } from '../../../core/theme/typography';

type Props = {
  service: Service;
  onBack: () => void;
  onEnquiry: () => void;
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

function getHighlights(name: string): string[] {
  const lower = name.toLowerCase();
  if (lower.includes('two') || lower.includes('two-wheeler') || lower.includes('bike')) {
    return ['Third-party liability', 'Own damage cover', 'Zero depreciation add-on', 'Roadside assistance'];
  }
  if (lower.includes('car')) {
    return ['Comprehensive coverage', 'Cashless repairs', 'Zero depreciation', 'Engine protection'];
  }
  if (lower.includes('personal accident') || lower.includes('accident')) {
    return ['Accidental death benefit', 'Permanent disability cover', 'Temporary disability income', 'Medical expense cover'];
  }
  if (lower.includes('top-up') || lower.includes('super')) {
    return ['Covers beyond base policy', 'Lower premiums', 'No sub-limits', 'Family floater option'];
  }
  return ['Comprehensive coverage', 'Expert guidance', 'Quick processing', 'Dedicated support'];
}

function OtherInsuranceLandingScreen({ service, onBack, onEnquiry }: Props) {
  const highlights = getHighlights(service.name);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
            <BackIcon />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{service.name}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={{ uri: service.service_image }}
            style={styles.heroImg}
            resizeMode="contain"
          />
          <Text style={styles.heroName}>{service.name}</Text>
          <Text style={styles.heroDesc}>{service.description}</Text>
          <View style={styles.heroPriceRow}>
            <View style={styles.priceTag}>
              <Text style={styles.priceTagText}>Starting ₹{service.price}</Text>
            </View>
            <View style={styles.dayTag}>
              <Text style={styles.dayTagText}>~{service.estimated_days} day{service.estimated_days !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaWrap}>
          <Pressable
            onPress={onEnquiry}
            style={({ pressed }) => [styles.enquiryBtn, pressed && styles.pressed]}>
            <Text style={styles.enquiryBtnText}>Get Enquiry</Text>
          </Pressable>
        </View>

        {/* Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Covered</Text>
          {highlights.map(item => (
            <View key={item} style={styles.highlightRow}>
              <View style={styles.highlightDot} />
              <Text style={styles.highlightText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          {[
            { step: '1', title: 'Submit Enquiry', desc: 'Fill your details and requirements' },
            { step: '2', title: 'Expert Consultation', desc: 'Our advisor contacts you within 24 hours' },
            { step: '3', title: 'Policy Issuance', desc: 'Get your policy documents digitally' },
          ].map(s => (
            <View key={s.step} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNum}>{s.step}</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom CTA */}
        <Pressable
          onPress={onEnquiry}
          style={({ pressed }) => [styles.bottomCta, pressed && styles.pressed]}>
          <Text style={styles.bottomCtaText}>Submit Enquiry Now →</Text>
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
    fontSize: 16,
    ...inter18('bold'),
    color: '#14532D',
    paddingHorizontal: 8,
  },
  headerSpacer: { width: 34 },

  hero: {
    backgroundColor: '#E8F5E0',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 12,
  },
  heroImg: { width: 130, height: 130, marginBottom: 14 },
  heroName: {
    fontSize: 22,
    ...inter18('bold'),
    color: '#14532D',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  heroPriceRow: { flexDirection: 'row', gap: 10 },
  priceTag: {
    backgroundColor: '#14532D',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  priceTagText: { color: '#FFFFFF', fontSize: 13, ...inter18('bold') },
  dayTag: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  dayTagText: { color: '#14532D', fontSize: 13, ...inter18('semiBold') },

  ctaWrap: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  enquiryBtn: {
    backgroundColor: '#6B21A8',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  enquiryBtnText: { color: '#FFFFFF', fontSize: 15, ...inter18('bold') },
  pressed: { opacity: 0.82 },

  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    ...inter18('bold'),
    color: '#111111',
    marginBottom: 14,
  },

  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  highlightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 12,
  },
  highlightText: { fontSize: 14, color: '#374151' },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  stepNum: { fontSize: 14, color: '#6B21A8', ...inter18('bold') },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 14, color: '#111111', marginBottom: 3, ...inter18('bold') },
  stepDesc: { fontSize: 13, color: '#666666' },

  bottomCta: {
    backgroundColor: '#6B21A8',
    margin: 16,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 32,
  },
  bottomCtaText: { color: '#FFFFFF', fontSize: 15, ...inter18('bold') },
});

export default OtherInsuranceLandingScreen;

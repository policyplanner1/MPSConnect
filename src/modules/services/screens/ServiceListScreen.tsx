import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useGovernmentServices } from '../hooks/useServices';
import { Service } from '../types/service.types';

const HeartImg = require('../../../assets/images/heart-img.png');
const ServiceCardBg = require('../../../assets/images/service-card-bg.png');

type Props = {
  onBack: () => void;
  onServicePress: (serviceId: number, service: Service) => void;
  categoryId?: number;
};

/* ─── Icons ─────────────────────────────────────────────── */

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

function ShareIcon() {
  return (
    <Svg height={17} viewBox="0 0 24 24" width={17}>
      <Path
        d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
        fill="none"
        stroke="#1A5C35"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </Svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <Svg height={19} viewBox="0 0 24 24" width={19}>
      <Path
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
        fill={filled ? '#EF4444' : 'none'}
        stroke={filled ? '#EF4444' : '#BBBBBB'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </Svg>
  );
}

/* ─── Hero banner ───────────────────────────────────────── */

const BANNER_CONTENT: Record<number, { title: string; sub: string; bullets: string[] }> = {
  2: {
    title: 'Insurance Made\nSimple.',
    sub: 'Protect what matters most',
    bullets: ['quick coverage', 'expert guidance', 'hassle-free claims'],
  },
  3: {
    title: 'Your Documents.\nDone Right.',
    sub: 'Government documents in minutes',
    bullets: ['fast processing', 'smooth support', 'zero hassle'],
  },
};

function HeroBanner({ onBack, categoryId = 3 }: { onBack: () => void; categoryId?: number }) {
  const content = BANNER_CONTENT[categoryId] ?? BANNER_CONTENT[3];
  return (
    <View style={styles.banner}>
      <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
        <BackIcon />
      </Pressable>

      <View style={styles.bannerBody}>
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerTitle}>{content.title}</Text>
          <Text style={styles.bannerSub}>{content.sub}</Text>
          <View style={styles.bullets}>
            {content.bullets.map(t => (
              <View key={t} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <Image source={HeartImg} style={styles.bannerImg} resizeMode="contain" />
      </View>

      <Pressable style={styles.shareBtn}>
        <ShareIcon />
      </Pressable>
    </View>
  );
}

/* ─── Horizontal active-service card ───────────────────── */

function ActiveCard({ service }: { service: Service }) {
  return (
    <View style={styles.activeCard}>
      <View style={styles.activeIconWrap}>
        <Image
          source={{ uri: service.service_image }}
          style={styles.activeImg}
          resizeMode="contain"
        />
      </View>
      <View style={styles.activeInfo}>
        <Text style={styles.activeName} numberOfLines={1}>{service.name}</Text>
        <Text style={styles.activeId} numberOfLines={1}>
          ID: {String(service.id).padStart(11, '8')}
        </Text>
        <View style={styles.activeStatusRow}>
          <View style={styles.activeDot} />
          <Text style={styles.activeStatus}>Active · Available</Text>
        </View>
      </View>
      {service.price ? (
        <Text style={styles.activePrice}>₹{service.price}</Text>
      ) : null}
    </View>
  );
}

/* ─── Vertical service card ─────────────────────────────── */

function ServiceCard({ item, onPress, buttonLabel = 'Buy now' }: { item: Service; onPress: () => void; buttonLabel?: string }) {
  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.serviceCard}>
      {/* Left — image box with heart inside */}
      <View style={styles.cardImgBox}>
        <Image
          source={{ uri: item.service_image }}
          style={styles.cardImg}
          resizeMode="contain"
        />
        <Pressable
          onPress={() => setLiked(v => !v)}
          style={styles.heartBtn}
          hitSlop={8}>
          <HeartIcon filled={liked} />
        </Pressable>
      </View>

      {/* Right — name, desc, button */}
      <View style={styles.cardRight}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={3}>{item.description}</Text>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.buyBtn, pressed && styles.buyBtnPressed]}>
          <Text style={styles.buyBtnText}>{buttonLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ─── Stats row ─────────────────────────────────────────── */

function StatsRow() {
  const stats = [
    { num: '30+', label: 'Services\nAcross India' },
    { num: '25,000+', label: 'Applications\nProcessed' },
    { num: '5+ Years', label: 'Experience' },
  ];
  return (
    <View style={styles.statsRow}>
      {stats.map((s, i) => (
        <React.Fragment key={s.num}>
          {i > 0 && <View style={styles.statDivider} />}
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{s.num}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

/* ─── Help / CTA section ────────────────────────────────── */


function HelpSection() {
  return (
    <ImageBackground
      source={ServiceCardBg}
      style={styles.helpWrap}
      imageStyle={styles.helpBgImage}
      resizeMode="cover">
      <Text style={styles.helpTitle}>Need a little help with Insurance?</Text>
      <Text style={styles.helpSub}>
        Not sure what to choose or where to start?{'\n'}
        Talk to our team we'll walk you through it, step by step.
      </Text>
      <Image source={HeartImg} style={styles.helpImg} resizeMode="contain" />
      <View style={styles.helpBottom}>
        <View style={styles.phoneBox}>
          <Text style={styles.phoneText}>+91 7798 612243</Text>
        </View>
        <Pressable style={styles.talkBtn}>
          <Text style={styles.talkBtnText}>Talk To Us</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

/* ─── Screen ─────────────────────────────────────────────── */

function ServiceListScreen({ onBack, onServicePress, categoryId = 3 }: Props) {
  const { services, loading } = useGovernmentServices(categoryId);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}>

        <HeroBanner onBack={onBack} categoryId={categoryId} />

        {/* Horizontal featured services */}
        {/* {!loading && services.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            style={styles.hScroll}>
            {services.map(s => <ActiveCard key={s.id} service={s} />)}
          </ScrollView>
        )} */}

        {/* Vertical service cards */}
        <View style={styles.vList}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#9E8DFF"
              style={{ marginVertical: 40 }}
            />
          ) : (
            services.map(s => (
              <ServiceCard
                key={s.id}
                item={s}
                onPress={() => onServicePress(s.id, s)}
                buttonLabel={categoryId === 2 ? 'Get a Quote' : 'Buy now'}
              />
            ))
          )}
        </View>

        <StatsRow />
        <HelpSection />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#E8F5E0',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },

  /* Banner */
  banner: {
    backgroundColor: '#E8F5E0',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 22,
    position: 'relative',
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  bannerBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bannerLeft: {
    flex: 1,
    paddingRight: 6,
  },
  bannerTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#14532D',
    lineHeight: 30,
    marginBottom: 6,
  },
  bannerSub: {
    fontSize: 13,
    color: '#2D6A4F',
    marginBottom: 12,
  },
  bullets: {
    gap: 5,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2D6A4F',
    marginRight: 8,
  },
  bulletText: {
    fontSize: 13,
    color: '#374151',
  },
  bannerImg: {
    width: 128,
    height: 128,
    marginTop: -4,
  },
  shareBtn: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  /* Horizontal scroll */
  hScroll: {
    backgroundColor: '#F4F4F4',
  },
  hList: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 12,
  },
  activeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 230,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  activeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F0ECFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  activeImg: {
    width: 30,
    height: 30,
  },
  activeInfo: {
    flex: 1,
  },
  activeName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 2,
  },
  activeId: {
    fontSize: 11,
    color: '#777777',
    marginBottom: 4,
  },
  activeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },
  activeStatus: {
    fontSize: 11,
    color: '#22C55E',
    fontWeight: '600',
  },
  activePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginLeft: 10,
  },

  /* Vertical service cards */
  vList: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 14,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardImgBox: {
    width: 120,
    borderRadius: 14,
    backgroundColor: '#F5F0EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    position: 'relative',
    flexShrink: 0,
  },
  cardImg: {
    width: 78,
    height: 78,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  cardRight: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    lineHeight: 22,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 19,
    flex: 1,
    marginBottom: 12,
  },
  buyBtn: {
    backgroundColor: '#6B21A8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buyBtnPressed: {
    opacity: 0.82,
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Stats */
  statsRow: {
    backgroundColor: '#EEF2FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1E1E',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 15,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#CCCCCC',
  },

  /* Help section */
  helpWrap: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 32,
    padding: 24,
    alignItems: 'center',
  },
  helpBgImage: {
    borderRadius: 20,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: 10,
  },
  helpSub: {
    fontSize: 13,
    color: '#3D3D5C',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  helpImg: {
    width: 140,
    height: 140,
    marginVertical: 10,
  },
  helpBottom: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  phoneBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  phoneText: {
    color: '#1A1A2E',
    fontSize: 13,
    fontWeight: '600',
  },
  talkBtn: {
    backgroundColor: '#F5C518',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  talkBtnText: {
    color: '#111111',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default ServiceListScreen;

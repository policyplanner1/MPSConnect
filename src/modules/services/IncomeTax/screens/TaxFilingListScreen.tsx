import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { inter18 } from '../../../../core/theme/typography';
import { useGovernmentServices } from '../../hooks/useServices';
import { useServiceCart } from '../../hooks/useServiceCart';
import { Service } from '../../types/service.types';
import { TAX_FILING_CATEGORY_ID } from '../constants';

const ServiceCardBg = require('../../../../assets/images/service-card-bg.png');
const HeartImg = require('../../../../assets/images/heart-img.png');

function formatTaxPrice(price: string | number | undefined): string | null {
  if (price == null || price === '') {
    return null;
  }
  const amount = typeof price === 'number' ? price : parseFloat(price);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

type TaxFilingListScreenProps = {
  onBack: () => void;
  onServicePress: (serviceId: number, service: Service) => void;
  initialServiceId?: number;
  onOpenNotifications?: () => void;
  onOpenCart?: () => void;
  cartItemCount?: number;
};

function BackIcon() {
  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Path
        d="M15 18L9 12L15 6"
        fill="none"
        stroke="#7A5F1E"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
    </Svg>
  );
}

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

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <Svg height={17} viewBox="0 0 24 24" width={17}>
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

function BellIcon() {
  return (
    <Svg height={22} viewBox="0 0 24 24" width={22}>
      <Path
        d="M12 4.5C9.7 4.5 8 6.3 8 8.6V10.1C8 11.1 7.7 12.1 7.1 13L6 14.7V16H18V14.7L16.9 13C16.3 12.1 16 11.1 16 10.1V8.6C16 6.3 14.3 4.5 12 4.5Z"
        fill="none"
        stroke="#111827"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </Svg>
  );
}

function BuyNowButton({ onPress, price }: { onPress: () => void; price?: string | number }) {
  const formatted = formatTaxPrice(price);
  const label = formatted ? `Buy now ₹${formatted}` : 'Buy now';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.buyBtnOuter, pressed && { opacity: 0.9 }]}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="taxBuyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#9E8DFF" />
            <Stop offset="100%" stopColor="#5E02AF" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height={44} rx={10} fill="url(#taxBuyGrad)" />
      </Svg>
      <Text style={[styles.buyBtnText, inter18('bold')]}>{label}</Text>
    </Pressable>
  );
}

function TaxHeroBanner({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.hero}>
      <Pressable onPress={onBack} style={styles.heroBackBtn} hitSlop={10}>
        <BackIcon />
      </Pressable>
      <View style={styles.heroBody}>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, inter18('bold')]}>ITR Filing made simple</Text>
          {['Accurate', 'Timely', 'Stress-Free'].map(label => (
            <View key={label} style={styles.heroBulletRow}>
              <View style={styles.heroBulletDot} />
              <Text style={[styles.heroBulletText, inter18('regular')]}>{label}</Text>
            </View>
          ))}
        </View>
        <Image source={HeartImg} style={styles.heroArt} resizeMode="contain" />
      </View>
    </View>
  );
}

function FeaturedServiceCard({
  service,
  onPress,
}: {
  service: Service;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.featuredCard, pressed && { opacity: 0.94 }]}>
      <View style={styles.featuredIconWrap}>
        <Image source={{ uri: service.service_image }} style={styles.featuredIcon} resizeMode="contain" />
      </View>
      <View style={styles.featuredInfo}>
        <Text style={[styles.featuredName, inter18('bold')]} numberOfLines={2}>
          {service.name}
        </Text>
        <Text style={[styles.featuredMeta, inter18('regular')]}>
          Est. {service.estimated_days} day{service.estimated_days === 1 ? '' : 's'}
        </Text>
      </View>
      {service.price ? (
        <Text style={[styles.featuredPrice, inter18('bold')]}>₹{service.price}</Text>
      ) : null}
    </Pressable>
  );
}

function TaxServiceCard({
  item,
  onPress,
}: {
  item: Service;
  onPress: () => void;
}) {
  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.serviceCard}>
      <View style={styles.cardImgBox}>
        <Image source={{ uri: item.service_image }} style={styles.cardImg} resizeMode="contain" />
        <Pressable onPress={() => setLiked(v => !v)} style={styles.heartBtn} hitSlop={8}>
          <HeartIcon filled={liked} />
        </Pressable>
      </View>
      <View style={styles.cardRight}>
        <Text style={[styles.cardName, inter18('bold')]}>{item.name}</Text>
        <Text numberOfLines={3} style={[styles.cardDesc, inter18('regular')]}>
          {item.description}
        </Text>
        <BuyNowButton onPress={onPress} price={item.price} />
      </View>
    </View>
  );
}

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
          {i > 0 ? <View style={styles.statDivider} /> : null}
          <View style={styles.statItem}>
            <Text style={[styles.statNum, inter18('bold')]}>{s.num}</Text>
            <Text style={[styles.statLabel, inter18('regular')]}>{s.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

function TaxHelpSection() {
  return (
    <ImageBackground
      source={ServiceCardBg}
      style={styles.helpWrap}
      imageStyle={styles.helpBgImage}
      resizeMode="cover">
      <Text style={[styles.helpTitle, inter18('bold')]}>Confused about Tax Filing?</Text>
      <Text style={[styles.helpSub, inter18('regular')]}>
        From documents to submission, it can feel overwhelming. Our experts are here to guide you
        at every step.
      </Text>
      <Image source={HeartImg} style={styles.helpImg} resizeMode="contain" />
      <View style={styles.helpBottom}>
        <View style={styles.phoneBox}>
          <Text style={[styles.phoneText, inter18('semiBold')]}>+91 81093 11213</Text>
        </View>
        <Pressable style={styles.talkBtn}>
          <Text style={[styles.talkBtnText, inter18('bold')]}>Talk To Us</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

export default function TaxFilingListScreen({
  onBack,
  onServicePress,
  initialServiceId,
  onOpenNotifications,
  onOpenCart,
  cartItemCount,
}: TaxFilingListScreenProps) {
  const { services, loading } = useGovernmentServices(TAX_FILING_CATEGORY_ID);
  const { items: cartItems } = useServiceCart();
  const didAutoOpenRef = useRef(false);
  const cartCount = cartItemCount ?? (cartItems.length > 0 ? cartItems.length : undefined);

  const featuredServices = useMemo(() => services.slice(0, 4), [services]);

  useEffect(() => {
    if (!initialServiceId || loading || didAutoOpenRef.current) {
      return;
    }

    const match = services.find(service => service.id === initialServiceId);
    didAutoOpenRef.current = true;

    if (match) {
      onServicePress(match.id, match);
      return;
    }

    onServicePress(initialServiceId, {
      id: initialServiceId,
      name: '',
      description: '',
      price: '',
      estimated_days: 0,
      service_image: '',
    });
  }, [initialServiceId, loading, onServicePress, services]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.topBar}>
          <Pressable onPress={onBack} style={styles.topBackBtn} hitSlop={8}>
            <BackIcon />
          </Pressable>
          <View style={styles.searchBar}>
            <SearchIcon />
            <Text style={[styles.searchPlaceholder, inter18('regular')]}>Search &quot;ITR Filing&quot;</Text>
          </View>
          <View style={styles.topActions}>
            {onOpenCart ? (
              <Pressable onPress={onOpenCart} style={styles.iconBtn}>
                <Text style={styles.cartGlyph}>🛒</Text>
                {cartCount != null && cartCount > 0 ? (
                  <View style={styles.cartBadge}>
                    <Text style={[styles.cartBadgeText, inter18('bold')]}>
                      {cartCount > 9 ? '9+' : cartCount}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            ) : null}
            {onOpenNotifications ? (
              <Pressable onPress={onOpenNotifications} style={styles.iconBtn}>
                <BellIcon />
                <View style={styles.notifDot} />
              </Pressable>
            ) : null}
          </View>
        </View>

        <TaxHeroBanner onBack={onBack} />

        {!loading && featuredServices.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
            style={styles.featuredScroll}>
            {featuredServices.map(service => (
              <FeaturedServiceCard
                key={service.id}
                service={service}
                onPress={() => onServicePress(service.id, service)}
              />
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.vList}>
          {loading ? (
            <ActivityIndicator size="large" color="#5E02AF" style={styles.loader} />
          ) : (
            services.map(service => (
              <TaxServiceCard
                key={service.id}
                item={service}
                onPress={() => onServicePress(service.id, service)}
              />
            ))
          )}
        </View>

        <StatsRow />
        <TaxHelpSection />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF8E8',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFF8E8',
  },
  topBackBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    minWidth: 0,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E4C8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: '#9CA3AF',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartGlyph: {
    fontSize: 18,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#5E02AF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  hero: {
    backgroundColor: '#FFF8E8',
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  heroBackBtn: {
    display: 'none',
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroCopy: {
    flex: 1,
    paddingRight: 8,
  },
  heroTitle: {
    fontSize: 24,
    color: '#5C4518',
    lineHeight: 30,
    marginBottom: 12,
  },
  heroBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9A7B2E',
    marginRight: 8,
  },
  heroBulletText: {
    fontSize: 14,
    color: '#6B5B2E',
  },
  heroArt: {
    width: 118,
    height: 118,
    marginTop: -6,
  },
  featuredScroll: {
    backgroundColor: '#F4F4F4',
  },
  featuredList: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 12,
  },
  featuredCard: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFF4D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredIcon: {
    width: 30,
    height: 30,
  },
  featuredInfo: {
    flex: 1,
    minWidth: 0,
  },
  featuredName: {
    fontSize: 13,
    color: '#111111',
    marginBottom: 4,
  },
  featuredMeta: {
    fontSize: 11,
    color: '#6B7280',
  },
  featuredPrice: {
    fontSize: 14,
    color: '#111111',
  },
  vList: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 14,
  },
  loader: {
    marginVertical: 40,
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
    backgroundColor: '#FFF4D6',
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
    minWidth: 0,
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: 16,
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
  buyBtnOuter: {
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#5E02AF',
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    zIndex: 1,
  },
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
  },
});

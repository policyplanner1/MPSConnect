import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';
import CategorySection from '../components/CategorySection';
import ExploreHeader from '../components/ExploreHeader';
import OfferBanner from '../components/OfferBanner';
import SearchBar from '../components/SearchBar';
import ServiceCard from '../components/ServiceCard';
import type { ExploreBanner } from '../api/bannersApi';
import { useExploreLocationLabel } from '../hooks';
import {
  EXPLORE_CATEGORIES,
  EXPLORE_USER,
  isExploreHealthInsuranceService,
  LIMITED_OFFER_SERVICE,
  type ExploreServiceItem,
} from '../data/exploreData';

type ExploreScreenProps = {
  onOpenNotifications?: () => void;
  onProfilePress?: () => void;
  onReferPress?: () => void;
  onServicePress?: (service: ExploreServiceItem) => void;
  onHealthInsurancePress?: () => void;
  onBannerPress?: (banner: ExploreBanner) => void;
  profileInitials?: string;
  userName?: string;
};

function handleExploreServicePress(
  service: ExploreServiceItem,
  handlers: {
    onServicePress?: (service: ExploreServiceItem) => void;
    onHealthInsurancePress?: () => void;
  },
) {
  if (isExploreHealthInsuranceService(service)) {
    handlers.onHealthInsurancePress?.();
    return;
  }
  handlers.onServicePress?.(service);
}

function ReferBanner({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.referBanner, pressed && { opacity: 0.92 }]}>
      <View style={styles.referCopy}>
        <Text style={[styles.referTitle, inter18('bold')]}>FLAT 10% OFF</Text>
        <Text style={[styles.referSub, inter18('regular')]}>
          On your first order · Use code FIRST10
        </Text>
      </View>
      <Text style={styles.referEmoji}>📁</Text>
    </Pressable>
  );
}

function LimitedOfferSection({
  onServicePress,
}: {
  onServicePress?: (service: ExploreServiceItem) => void;
}) {
  return (
    <View style={styles.limitedWrap}>
      <View style={styles.limitedHeader}>
        <Text style={styles.limitedEmoji}>⏰</Text>
        <View style={styles.limitedBadge}>
          <Text style={[styles.limitedBadgeText, inter18('bold')]}>LIMITED TIME OFFER</Text>
        </View>
      </View>
      <View style={styles.limitedCardWrap}>
        <ServiceCard
          service={LIMITED_OFFER_SERVICE}
          onPress={() => onServicePress?.(LIMITED_OFFER_SERVICE)}
        />
      </View>
    </View>
  );
}

export default function ExploreScreen({
  onOpenNotifications,
  onProfilePress,
  onReferPress,
  onServicePress,
  onHealthInsurancePress,
  onBannerPress,
  profileInitials,
  userName,
}: ExploreScreenProps) {
  const categoriesBeforeRefer = EXPLORE_CATEGORIES.slice(0, 2);
  const categoriesAfterRefer = EXPLORE_CATEGORIES.slice(2);
  const locationLabel = useExploreLocationLabel();

  const onExploreServicePress = (service: ExploreServiceItem) => {
    handleExploreServicePress(service, { onServicePress, onHealthInsurancePress });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        bounces
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[2]}
        contentContainerStyle={styles.scroll}>
        <View style={styles.headerBlock}>
          <View pointerEvents="none" style={styles.headerBg}>
            <Svg height="100%" width="100%">
              <Rect fill="#E8DEFF" height="100%" width="100%" x="0" y="0" />
            </Svg>
          </View>

          <ExploreHeader
            userName={userName ?? EXPLORE_USER.name}
            userInitials={profileInitials ?? EXPLORE_USER.initials}
            onNotificationPress={onOpenNotifications}
            onProfilePress={onProfilePress}
          />
        </View>

        <View style={styles.bannerWrap}>
          <OfferBanner onBannerPress={onBannerPress} />
        </View>

        <View style={styles.stickySearchWrap}>
          <SearchBar location={locationLabel} />
        </View>

        {categoriesBeforeRefer.map(category => (
          <CategorySection
            key={category.id}
            category={category}
            onServicePress={onExploreServicePress}
          />
        ))}

        <ReferBanner onPress={onReferPress} />

        {categoriesAfterRefer.map((category, index) => (
          <React.Fragment key={category.id}>
            {index === 1 ? (
              <LimitedOfferSection onServicePress={onExploreServicePress} />
            ) : null}
            <CategorySection category={category} onServicePress={onExploreServicePress} />
          </React.Fragment>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  headerBlock: {
    position: 'relative',
    backgroundColor: '#E8DEFF',
    paddingBottom: 12,
  },
  headerBg: {
    ...StyleSheet.absoluteFill,
  },
  bannerWrap: {
    backgroundColor: '#E8DEFF',
    paddingBottom: 6,
  },
  stickySearchWrap: {
    backgroundColor: '#E8DEFF',
    paddingBottom: 12,
    bottom: 10,
  },
  scroll: {
    paddingBottom: 130,
    paddingTop: 4,
  },
  referBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  referCopy: {
    flex: 1,
    gap: 4,
  },
  referTitle: {
    fontSize: 16,
    color: '#166534',
  },
  referSub: {
    fontSize: 12,
    color: '#15803D',
    lineHeight: 17,
  },
  referEmoji: {
    fontSize: 40,
  },
  limitedWrap: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  limitedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  limitedEmoji: {
    fontSize: 28,
  },
  limitedBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  limitedBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  limitedCardWrap: {
    alignItems: 'center',
  },
});

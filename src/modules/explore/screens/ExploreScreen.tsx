import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LimitedTimeOfferBackground from '../../../assets/images/limited time offer background.svg';
import LimitedTimeOfferImage from '../../../assets/images/limited time offer image.svg';
import { inter18 } from '../../../core/theme/typography';
import HomeHeroHeader from '../../services/components/HomeHeroHeader';
import HomeSearchBar from '../../services/components/HomeSearchBar';
import CategorySection from '../components/CategorySection';
import OfferBanner from '../components/OfferBanner';
import ServiceCard from '../components/ServiceCard';
import type { ExploreBanner } from '../api/bannersApi';
import {
  CERTIFICATES,
  EXPLORE_USER,
  IDENTITY_DOCUMENTS,
  isExploreHealthInsuranceService,
  LIMITED_OFFER_SERVICES,
  TAX_SEASON_ESSENTIALS,
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
        <Text style={[styles.referTitle, inter18('bold')]}>REFER AND EARN</Text>
        <Text style={[styles.referSub, inter18('regular')]}>
          Invite friends and earn rewards on every order
        </Text>
      </View>
      <Text style={styles.referEmoji}>🎁</Text>
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
      <View pointerEvents="none" style={styles.limitedBackground}>
        <LimitedTimeOfferBackground height="100%" preserveAspectRatio="none" width="100%" />
      </View>

      <View style={styles.limitedRow}>
        <View style={styles.limitedArtWrap}>
          <LimitedTimeOfferImage height={152} preserveAspectRatio="xMinYMid meet" width={132} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.limitedScrollContent}
          decelerationRate="fast"
          style={styles.limitedScroll}>
          {LIMITED_OFFER_SERVICES.map((service, index) => (
            <View
              key={service.id}
              style={[
                styles.limitedCardItem,
                index === LIMITED_OFFER_SERVICES.length - 1 && styles.limitedCardItemLast,
              ]}>
              <ServiceCard
                service={service}
                onPress={() => onServicePress?.(service)}
              />
            </View>
          ))}
        </ScrollView>
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
          <HomeHeroHeader
            profileInitials={profileInitials ?? EXPLORE_USER.initials}
            userName={userName ?? EXPLORE_USER.name}
            greeting="Hi,"
            onProfilePress={onProfilePress}
            onNotificationPress={onOpenNotifications}
            notificationCount={1}
            showCart={false}
            showHeroCopy={false}
            showHeroCurve={false}
            showChatIcon={false}
            heroBackgroundColor="#E8DEFF"
          />
        </View>

        <View style={styles.bannerWrap}>
          <OfferBanner onBannerPress={onBannerPress} />
        </View>

        <View style={styles.stickySearchWrap}>
          <HomeSearchBar compact />
        </View>

        <CategorySection
          category={TAX_SEASON_ESSENTIALS}
          onServicePress={onExploreServicePress}
        />

        <ReferBanner onPress={onReferPress} />

        <CategorySection
          category={IDENTITY_DOCUMENTS}
          onServicePress={onExploreServicePress}
        />

        <CategorySection category={CERTIFICATES} onServicePress={onExploreServicePress} />

        <LimitedOfferSection onServicePress={onExploreServicePress} />
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
    backgroundColor: '#E8DEFF',
    paddingBottom: 12,
  },
  bannerWrap: {
    backgroundColor: '#E8DEFF',
    paddingBottom: 6,
  },
  stickySearchWrap: {
    backgroundColor: '#E8DEFF',
    paddingHorizontal: 16,
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
    marginLeft: 16,
    marginRight: 0,
    marginBottom: 16,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    paddingVertical: 10,
    paddingLeft: 0,
    paddingRight: 0,
  },
  limitedBackground: {
    ...StyleSheet.absoluteFill,
  },
  limitedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 152,
  },
  limitedArtWrap: {
    width: 132,
    alignSelf: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  limitedScroll: {
    flex: 1,
  },
  limitedScrollContent: {
    paddingLeft: 8,
    paddingRight: 16,
    paddingBottom: 4,
    alignItems: 'center',
  },
  limitedCardItem: {
    marginRight: 12,
  },
  limitedCardItemLast: {
    marginRight: 4,
  },
});

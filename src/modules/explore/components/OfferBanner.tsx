import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { resolveBannerImageUri, type ExploreBanner } from '../api/bannersApi';
import { useExploreBanners } from '../hooks/useExploreBanners';

const AUTO_SLIDE_MS = 4000;
const HORIZONTAL_INSET = 16;
const BANNER_CARD_HEIGHT = 172;

type OfferBannerProps = {
  onBannerPress?: (banner: ExploreBanner) => void;
};

function BannerSlide({
  banner,
  cardWidth,
  onPress,
}: {
  banner: ExploreBanner;
  cardWidth: number;
  onPress?: () => void;
}) {
  const imageUri = resolveBannerImageUri(banner.imageUrl);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        { width: cardWidth, height: BANNER_CARD_HEIGHT },
        pressed && onPress ? { opacity: 0.96 } : null,
      ]}
      accessibilityLabel={banner.title}
      accessibilityRole="button">
      <Image
        source={{ uri: imageUri }}
        style={styles.fullImage}
        resizeMode="cover"
      />
    </Pressable>
  );
}

export default function OfferBanner({ onBannerPress }: OfferBannerProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - HORIZONTAL_INSET * 2;
  const listRef = useRef<FlatList<ExploreBanner>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { banners, loading } = useExploreBanners();

  const getItemLayout = useCallback(
    (_: ArrayLike<ExploreBanner> | null | undefined, index: number) => ({
      length: screenWidth,
      offset: screenWidth * index,
      index,
    }),
    [screenWidth],
  );

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % banners.length;
        listRef.current?.scrollToOffset({
          offset: next * screenWidth,
          animated: true,
        });
        return next;
      });
    }, AUTO_SLIDE_MS);

    return () => clearInterval(timer);
  }, [banners.length, screenWidth]);

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(Math.min(Math.max(nextIndex, 0), Math.max(banners.length - 1, 0)));
  };

  if (loading && banners.length === 0) {
    return (
      <View style={styles.loadingOuter}>
        <View
          style={[
            styles.loadingCard,
            { width: cardWidth, height: BANNER_CARD_HEIGHT, marginHorizontal: HORIZONTAL_INSET },
          ]}>
          <ActivityIndicator color="#7C3AED" />
        </View>
      </View>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={banners}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={screenWidth}
        snapToAlignment="start"
        disableIntervalMomentum
        bounces={false}
        style={styles.list}
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={handleMomentumEnd}
        renderItem={({ item }) => (
          <View style={[styles.slidePage, { width: screenWidth }]}>
            <BannerSlide
              banner={item}
              cardWidth={cardWidth}
              onPress={onBannerPress ? () => onBannerPress(item) : undefined}
            />
          </View>
        )}
      />

      {banners.length > 1 ? (
        <View style={styles.dots}>
          {banners.map((banner, index) => (
            <View
              key={banner.id}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 4,
  },
  list: {
    height: BANNER_CARD_HEIGHT,
  },
  loadingOuter: {
    marginBottom: 4,
    height: BANNER_CARD_HEIGHT,
  },
  loadingCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  slidePage: {
    height: BANNER_CARD_HEIGHT,
    paddingHorizontal: HORIZONTAL_INSET,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 4,
    minHeight: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B7280',
  },
});

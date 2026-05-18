import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { inter18 } from '../../../core/theme/typography';
import Slider1 from '../../../assets/images/slider1.svg';
import Slider2 from '../../../assets/images/slider2.svg';
import Slider3 from '../../../assets/images/slider3.svg';
import Slider4 from '../../../assets/images/slider4.svg';
import MaterialIcon from '../components/MaterialIcon';

type Slide = {
  id: string;
  title: string;
  accent: string;
  Illustration: React.ComponentType<{ width?: number | string; height?: number | string }>;
};

type OnboardingScreenProps = {
  onSignIn: () => void;
  onSkip: () => void;
};

const slides: Slide[] = [
  {
    id: 'trusted-desk',
    title: 'A trusted service desk in your pocket',
    accent: '#E8F5E9',
    Illustration: Slider1,
  },
  {
    id: 'experienced-help',
    title: 'Experienced help you can rely on',
    accent: '#E8EEF9',
    Illustration: Slider2,
  },
  {
    id: 'process-care',
    title: 'We take care of the process',
    accent: '#F8E8F5',
    Illustration: Slider3,
  },
  {
    id: 'timely-processing',
    title: 'Timely and efficient processing',
    accent: '#FFF4E8',
    Illustration: Slider4,
  },
];

function OnboardingScreen({ onSignIn, onSkip }: OnboardingScreenProps) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const getItemLayout = useCallback(
    (_: ArrayLike<Slide> | null | undefined, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  );

  const handleNext = () => {
    const isLastSlide = activeIndex === slides.length - 1;

    if (isLastSlide) {
      onSignIn();
      return;
    }

    const nextIndex = activeIndex + 1;
    listRef.current?.scrollToOffset({
      offset: nextIndex * width,
      animated: true,
    });
    setActiveIndex(nextIndex);
  };

  const handleMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(Math.min(Math.max(nextIndex, 0), slides.length - 1));
  };

  const renderSlide = ({ item }: ListRenderItemInfo<Slide>) => {
    const Illustration = item.Illustration;

    return (
      <View style={[styles.slide, { width }]}>
        <Text style={[styles.title, inter18('bold')]}>{item.title}</Text>

        <View style={styles.heroViewport}>
          <View
            style={[
              styles.illustrationCircle,
              { backgroundColor: item.accent },
            ]}>
            <Illustration height="66%" width="66%" />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleNext}
          style={styles.arrowButton}>
          <MaterialIcon color="#111827" name="arrow-forward" size={22} />
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View pointerEvents="none" style={styles.bottomGlow}>
          <Svg height="100%" preserveAspectRatio="none" width="100%">
            <Defs>
              <RadialGradient
                cx="50%"
                cy="100%"
                fx="50%"
                fy="100%"
                id="onboardingGlow"
                r="85%">
                <Stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.55" />
                <Stop offset="55%" stopColor="#FBCFE8" stopOpacity="0.2" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect fill="url(#onboardingGlow)" height="100%" width="100%" x="0" y="0" />
          </Svg>
        </View>

        <FlatList
          data={slides}
          getItemLayout={getItemLayout}
          horizontal
          keyExtractor={item => item.id}
          pagingEnabled
          ref={listRef}
          renderItem={renderSlide}
          showsHorizontalScrollIndicator={false}
          style={styles.slider}
          onMomentumScrollEnd={handleMomentumEnd}
        />

        <View style={styles.pagination}>
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <View
                key={slide.id}
                style={[
                  styles.dot,
                  isActive ? styles.activeDot : undefined,
                  isActive
                    ? { backgroundColor: slides[activeIndex].accent }
                    : undefined,
                ]}
              />
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onSkip}
          style={styles.skipButton}>
          <Text style={[styles.skipText, inter18('medium')]}>Skip for now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  bottomGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 260,
    zIndex: 0,
  },
  slider: {
    flex: 1,
    zIndex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 0,
  },
  title: {
    maxWidth: 320,
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'center',
    color: '#0A0A0A',
    marginTop: 28,
  },
  heroViewport: {
    alignSelf: 'stretch',
    height: 430,
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 28,
    marginHorizontal: -28,
  },
  illustrationCircle: {
    width: 400,
    height: 400,
    borderRadius: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    overflow: 'hidden',
  },
  arrowButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 10,
    marginTop: -56,
    zIndex: 2,
  },
  skipText: {
    fontSize: 15,
    color: '#374151',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    zIndex: 1,
  },
  skipButton: {
    alignItems: 'center',
    paddingBottom: 28,
    zIndex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  activeDot: {
    width: 24,
    borderRadius: 6,
  },
});

export default OnboardingScreen;

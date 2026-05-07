import React, { useRef, useState } from 'react';
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
import Slider1 from '../../../assets/images/slider1.svg';
import Slider2 from '../../../assets/images/slider2.svg';
import Slider3 from '../../../assets/images/slider3.svg';
import Slider4 from '../../../assets/images/slider4.svg';

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
    accent: '#E0FFD8',
    Illustration: Slider1,
  },
  {
    id: 'experienced-help',
    title: 'Experienced help you can rely on',
    accent: '#D8E3FF',
    Illustration: Slider2,
  },
  {
    id: 'process-care',
    title: 'We take care of the process',
    accent: '#FFD8FE',
    Illustration: Slider3,
  },
  {
    id: 'timely-processing',
    title: 'Timely and efficient processing',
    accent: '#FFE5D8',
    Illustration: Slider4,
  },
];

function OnboardingScreen({ onSignIn, onSkip }: OnboardingScreenProps) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    const isLastSlide = activeIndex === slides.length - 1;

    if (isLastSlide) {
      onSignIn();
      return;
    }

    const nextIndex = activeIndex + 1;
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setActiveIndex(nextIndex);
  };

  const handleMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(nextIndex);
  };

  const renderSlide = ({ item }: ListRenderItemInfo<Slide>) => {
    const Illustration = item.Illustration;

    return (
      <View style={[styles.slide, { width }]}>
        <Text style={styles.title}>{item.title}</Text>

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
          <Text style={styles.arrowText}>{'\u2192'}</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={slides}
          horizontal
          keyExtractor={item => item.id}
          pagingEnabled
          ref={listRef}
          renderItem={renderSlide}
          style={styles.slider}
          showsHorizontalScrollIndicator={false}
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
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fffaf5',
  },
  container: {
    flex: 1,
  },
  slider: {
    flex: 1,
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
    maxWidth: 210,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#171717',
    marginTop: 34,
  },
  heroViewport: {
    alignSelf: 'stretch',
    height: 430,
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 32,
    marginHorizontal: -28,
  },
  illustrationCircle: {
    width: 410,
    height: 410,
    borderRadius: 205,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    overflow: 'hidden',
  },
  arrowButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 10,
    marginTop: -52,
  },
  arrowText: {
    fontSize: 21,
    fontWeight: '400',
    color: '#1f2937',
    lineHeight: 21,
    marginTop: -1,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 10,
  },
  skipButton: {
    alignItems: 'center',
    paddingBottom: 26,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e5e7eb',
  },
  activeDot: {
    width: 28,
    borderRadius: 8,
  },
});

export default OnboardingScreen;

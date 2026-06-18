import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type AutoMarqueeScrollProps = {
  children: React.ReactNode;
  speed?: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export default function AutoMarqueeScroll({
  children,
  speed = 0.4,
  gap = 12,
  style,
  contentContainerStyle,
}: AutoMarqueeScrollProps) {
  const scrollRef = useRef<ScrollView>(null);
  const offsetRef = useRef(0);
  const segmentWidthRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused || segmentWidthRef.current <= 0) {
      return;
    }

    const step = () => {
      offsetRef.current += speed;
      if (offsetRef.current >= segmentWidthRef.current) {
        offsetRef.current = 0;
      }
      scrollRef.current?.scrollTo({ x: offsetRef.current, animated: false });
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current != null) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isPaused, speed]);

  const pause = () => setIsPaused(true);
  const resume = () => setIsPaused(false);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      bounces={false}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      onScrollBeginDrag={pause}
      onScrollEndDrag={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
      onMomentumScrollEnd={resume}
      style={style}
      contentContainerStyle={contentContainerStyle}>
      <View
        onLayout={event => {
          segmentWidthRef.current = event.nativeEvent.layout.width / 2;
        }}
        style={[styles.track, { gap }]}>
        <View style={[styles.segment, { gap }]}>{children}</View>
        <View style={[styles.segment, { gap }]}>{children}</View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
});

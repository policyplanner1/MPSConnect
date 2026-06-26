import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
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

function normalizeOffset(offset: number, segmentWidth: number): number {
  if (segmentWidth <= 0) {
    return offset;
  }
  let next = offset % segmentWidth;
  if (next < 0) {
    next += segmentWidth;
  }
  return next;
}

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
  const [segmentWidth, setSegmentWidth] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const animRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current != null) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const syncOffsetFromScroll = useCallback((x: number) => {
    const width = segmentWidthRef.current;
    if (width <= 0) {
      offsetRef.current = x;
      return;
    }

    const normalized = normalizeOffset(x, width);
    offsetRef.current = normalized;

    if (Math.abs(x - normalized) > 1) {
      scrollRef.current?.scrollTo({ x: normalized, animated: false });
    }
  }, []);

  const scheduleResume = useCallback(() => {
    clearResumeTimer();
    resumeTimerRef.current = setTimeout(() => {
      setIsUserInteracting(false);
      resumeTimerRef.current = null;
    }, 1200);
  }, [clearResumeTimer]);

  useEffect(() => {
    if (isUserInteracting || segmentWidth <= 0) {
      return;
    }

    const step = () => {
      const width = segmentWidthRef.current;
      if (width <= 0) {
        animRef.current = requestAnimationFrame(step);
        return;
      }

      offsetRef.current = normalizeOffset(offsetRef.current + speed, width);
      scrollRef.current?.scrollTo({ x: offsetRef.current, animated: false });
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current != null) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
  }, [isUserInteracting, segmentWidth, speed]);

  useEffect(() => () => clearResumeTimer(), [clearResumeTimer]);

  const handleScrollBeginDrag = () => {
    clearResumeTimer();
    setIsUserInteracting(true);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isUserInteracting) {
      offsetRef.current = event.nativeEvent.contentOffset.x;
    }
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    syncOffsetFromScroll(event.nativeEvent.contentOffset.x);
    scheduleResume();
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      bounces={false}
      nestedScrollEnabled
      scrollEventThrottle={16}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      onScroll={handleScroll}
      onScrollBeginDrag={handleScrollBeginDrag}
      onScrollEndDrag={handleScrollEnd}
      onMomentumScrollEnd={handleScrollEnd}
      style={style}
      contentContainerStyle={contentContainerStyle}>
      <View
        onLayout={event => {
          const width = event.nativeEvent.layout.width / 2;
          if (width > 0 && Math.abs(width - segmentWidthRef.current) > 1) {
            segmentWidthRef.current = width;
            setSegmentWidth(width);
          }
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

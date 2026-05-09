import React from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type ChatbotCardProps = ViewProps & {
  children?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

function ChatbotCard({
  children,
  contentStyle,
  style,
  ...viewProps
}: ChatbotCardProps) {
  return (
    <View {...viewProps} style={[styles.card, style]}>
      <View pointerEvents="none" style={styles.gradientWrap}>
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id="chatbotCardGradient" x1="0%" x2="100%" y1="100%" y2="0%">
              <Stop offset="0%" stopColor="#9581F1" />
              <Stop offset="100%" stopColor="#552389" />
            </LinearGradient>
          </Defs>
          <Rect
            fill="url(#chatbotCardGradient)"
            height="100%"
            rx="10"
            ry="10"
            width="100%"
            x="0"
            y="0"
          />
        </Svg>
      </View>

      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#552389',
  },
  gradientWrap: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});

export default ChatbotCard;

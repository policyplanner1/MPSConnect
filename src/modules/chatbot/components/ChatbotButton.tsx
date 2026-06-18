import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';

import { chatbotType } from '../theme/chatbotTypography';

type ChatbotButtonProps = PressableProps & {
  label: string;
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
};

function ChatbotButton({
  label,
  style,
  textStyle,
  ...pressableProps
}: ChatbotButtonProps) {
  return (
    <Pressable
      android_ripple={{ color: 'rgba(149, 129, 241, 0.08)' }}
      {...pressableProps}
      style={({ pressed }) => {
        const resolvedStyle =
          typeof style === 'function' ? style({ pressed }) : style;

        return [
          styles.button,
          pressed ? styles.buttonPressed : undefined,
          resolvedStyle,
        ];
      }}>
      <Text style={[styles.label, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8E73F1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  label: {
    ...chatbotType.actionButton,
  },
});

export default ChatbotButton;

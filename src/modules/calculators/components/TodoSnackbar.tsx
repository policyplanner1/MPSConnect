import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { inter18 } from '../../../core/theme/typography';

type TodoSnackbarProps = {
  message: string;
  actionLabel: string;
  onAction: () => void;
  visible: boolean;
};

function TodoSnackbar({ message, actionLabel, onAction, visible }: TodoSnackbarProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.bar}>
        <Text style={[styles.message, inter18('regular')]} numberOfLines={2}>
          {message}
        </Text>
        <Pressable hitSlop={8} onPress={onAction}>
          <Text style={[styles.action, inter18('semiBold')]}>{actionLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 88,
    zIndex: 20,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#1F2937',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  message: {
    flex: 1,
    fontSize: 13,
    color: '#F9FAFB',
  },
  action: {
    fontSize: 14,
    color: '#93C5FD',
  },
});

export default TodoSnackbar;

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { inter18 } from '../../../core/theme/typography';

export type SupportMode = 'chat' | 'ticket';

type SupportModeTabsProps = {
  /** Current screen; omit on the hub so both tabs stay tappable. */
  active?: SupportMode | null;
  onChat: () => void;
  onTicket: () => void;
};

function SupportModeTabs({ active, onChat, onTicket }: SupportModeTabsProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.row}>
        <Pressable
          onPress={onChat}
          disabled={active === 'chat'}
          style={({ pressed }) => [
            styles.tab,
            active === 'chat' && styles.tabActive,
            pressed && active !== 'chat' && styles.tabPressed,
          ]}>
          <Text
            style={[
              styles.tabText,
              inter18(active === 'chat' ? 'semiBold' : 'regular'),
              active === 'chat' && styles.tabTextActive,
            ]}>
            Chat assistant
          </Text>
        </Pressable>

        <Pressable
          onPress={onTicket}
          disabled={active === 'ticket'}
          style={({ pressed }) => [
            styles.tab,
            active === 'ticket' && styles.tabActive,
            pressed && active !== 'ticket' && styles.tabPressed,
          ]}>
          <Text
            style={[
              styles.tabText,
              inter18(active === 'ticket' ? 'semiBold' : 'regular'),
              active === 'ticket' && styles.tabTextActive,
            ]}>
            Create ticket
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  tabActive: {
    borderColor: '#6C4DFF',
    backgroundColor: '#F5F3FF',
  },
  tabPressed: {
    opacity: 0.9,
  },
  tabText: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#552389',
  },
});

export default SupportModeTabs;

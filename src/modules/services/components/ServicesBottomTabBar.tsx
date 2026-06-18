import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgProps } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';
import BottomHomeIcon from '../../../assets/images/icons/home_icon.svg';
import BottomRequestsIcon from '../../../assets/images/icons/shopping-bag.svg';
import BottomExploreIcon from '../../../assets/images/icons/navigation_icon.svg';
import BottomMoreIcon from '../../../assets/images/icons/bizz_logo.svg';

export type ServicesMainTab = 'home' | 'requests' | 'explore' | 'more';

type ServicesBottomTabBarProps = {
  activeTab: ServicesMainTab;
  onTabPress: (tab: ServicesMainTab) => void;
};

type SvgIconType = React.FC<SvgProps>;

function BottomTab({
  IconComponent,
  label,
  active = false,
  isSpecial = false,
  onPress,
}: {
  IconComponent: SvgIconType;
  label?: string;
  active?: boolean;
  isSpecial?: boolean;
  onPress?: () => void;
}) {
  if (isSpecial) {
    return (
      <View style={styles.bottomTabItem}>
        <Pressable onPress={onPress} style={styles.specialTabButton}>
          <IconComponent width={44} height={32} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.bottomTabItem}>
      <Pressable
        onPress={onPress}
        style={[styles.bottomTabButton, active ? styles.bottomTabButtonActive : undefined]}>
        <IconComponent width={24} height={24} />
        {label ? (
          <Text
            style={[
              styles.bottomTabText,
              inter18(active ? 'semiBold' : 'regular'),
              active ? styles.bottomTabTextActive : undefined,
            ]}>
            {label}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
}

export default function ServicesBottomTabBar({
  activeTab,
  onTabPress,
}: ServicesBottomTabBarProps) {
  return (
    <View style={styles.tabBarWrap}>
      <View style={styles.tabBar}>
        <BottomTab
          IconComponent={BottomHomeIcon}
          label="Home"
          active={activeTab === 'home'}
          onPress={() => onTabPress('home')}
        />
        <BottomTab
          IconComponent={BottomRequestsIcon}
          label="My requests"
          active={activeTab === 'requests'}
          onPress={() => onTabPress('requests')}
        />
        <BottomTab
          IconComponent={BottomExploreIcon}
          label="Explore"
          active={activeTab === 'explore'}
          onPress={() => onTabPress('explore')}
        />
        <BottomTab
          IconComponent={BottomMoreIcon}
          isSpecial
          active={activeTab === 'more'}
          onPress={() => onTabPress('more')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: {
    position: 'absolute',
    left: 4,
    right: 4,
    bottom: 10,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#070707',
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 18,
  },
  bottomTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTabButton: {
    width: '100%',
    minHeight: 60,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  bottomTabButtonActive: {
    backgroundColor: '#2B2B2F',
  },
  bottomTabText: {
    marginTop: 4,
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
  },
  bottomTabTextActive: {},
  specialTabButton: {
    width: '100%',
    minHeight: 60,
    borderRadius: 14,
    backgroundColor: '#EBDFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

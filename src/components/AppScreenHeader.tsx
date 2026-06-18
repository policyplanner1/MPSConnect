import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { inter18 } from '../core/theme/typography';

// ─── Shared icons ─────────────────────────────────────────────────────────────

function BackChevronIcon({ color = '#6B7280', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M15 6L9 12L15 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function SearchIcon({ color = '#374151', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.8" fill="none" />
      <Path
        d="M20 20L16.5 16.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function BellIcon({ color = '#111827', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 4.5C9.7 4.5 8 6.3 8 8.6V10.1C8 11.1 7.7 12.1 7.1 13L6 14.7V16H18V14.7L16.9 13C16.3 12.1 16 11.1 16 10.1V8.6C16 6.3 14.3 4.5 12 4.5Z"
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <Path
        d="M10.1 18C10.4 19 11.1 19.5 12 19.5C12.9 19.5 13.6 19 13.9 18"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </Svg>
  );
}

function HeartIcon({ color = '#111827', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 20.5s-6.5-4.2-8.8-8.1C1.5 9.2 3.4 5.5 7 5.5c2 0 3.2 1.2 5 3.2C13.8 6.7 15 5.5 17 5.5c3.6 0 5.5 3.7 3.8 6.9-2.3 3.9-8.8 8.1-8.8 8.1z"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
      />
    </Svg>
  );
}

function WalletIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M3 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H3V7z"
        fill="#92400E"
        stroke="#78350F"
        strokeWidth="1"
      />
      <Rect x="14" y="11" width="7" height="6" rx="1" fill="#B45309" />
      <Circle cx="17" cy="14" r="1" fill="#FDE68A" />
    </Svg>
  );
}

function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }
  const label = count > 99 ? '99+' : String(count);

  return (
    <View style={styles.notifyBadge}>
      <Text style={[styles.notifyBadgeText, inter18('bold')]}>{label}</Text>
    </View>
  );
}

function CircleIconButton({
  onPress,
  accessibilityLabel,
  children,
  badge,
}: {
  onPress?: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
  badge?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={accessibilityLabel}
      style={styles.circleBtn}
      hitSlop={6}>
      {children}
      {badge != null ? <NotificationBadge count={badge} /> : null}
    </Pressable>
  );
}

// ─── Variants ─────────────────────────────────────────────────────────────────

type HeaderCallbacks = {
  onBack?: () => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
};

export type AppScreenHeaderTitleProps = HeaderCallbacks & {
  variant: 'title';
  title: string;
  notificationCount?: number;
};

export type AppScreenHeaderSearchProps = HeaderCallbacks & {
  variant: 'search';
  searchPlaceholder?: string;
  onFavoritesPress?: () => void;
  onWalletPress?: () => void;
  walletBalance?: string;
  notificationCount?: number;
};

export type AppScreenHeaderProps = AppScreenHeaderTitleProps | AppScreenHeaderSearchProps;

function TitleVariant({
  title,
  onBack,
  onSearchPress,
  onNotificationPress,
  notificationCount = 1,
}: AppScreenHeaderTitleProps) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        disabled={!onBack}
        style={styles.titleLeft}
        hitSlop={8}
        accessibilityLabel="Go back">
        <BackChevronIcon color="#374151" />
        <Text style={[styles.screenTitle, inter18('medium')]} numberOfLines={1}>
          {title}
        </Text>
      </Pressable>

      <View style={styles.titleRight}>
        <CircleIconButton onPress={onSearchPress} accessibilityLabel="Search">
          <SearchIcon />
        </CircleIconButton>
        <CircleIconButton
          onPress={onNotificationPress}
          accessibilityLabel="Notifications"
          badge={notificationCount}>
          <BellIcon />
        </CircleIconButton>
      </View>
    </View>
  );
}

function SearchVariant({
  searchPlaceholder = 'Search services',
  onBack,
  onSearchPress,
  onFavoritesPress,
  onWalletPress,
  onNotificationPress,
  walletBalance = '₹6,549',
  notificationCount = 1,
}: AppScreenHeaderSearchProps) {
  return (
    <View style={styles.header}>
      <View style={styles.searchBar}>
        <Pressable
          onPress={onBack}
          disabled={!onBack}
          hitSlop={8}
          accessibilityLabel="Go back"
          style={styles.searchBarBack}>
          <BackChevronIcon color="#9CA3AF" size={18} />
        </Pressable>
        <Pressable
          onPress={onSearchPress}
          disabled={!onSearchPress}
          style={styles.searchBarTap}
          accessibilityLabel="Search">
          <Text style={[styles.searchPlaceholder, inter18('regular')]} numberOfLines={1}>
            {searchPlaceholder}
          </Text>
        </Pressable>
      </View>

      <View style={styles.searchRight}>
        <Pressable
          onPress={onFavoritesPress}
          disabled={!onFavoritesPress}
          style={styles.plainIconBtn}
          hitSlop={8}
          accessibilityLabel="Favorites">
          <HeartIcon />
        </Pressable>

        <Pressable
          onPress={onWalletPress}
          disabled={!onWalletPress}
          style={styles.walletWrap}
          hitSlop={4}
          accessibilityLabel="Wallet balance">
          <View style={styles.walletCircle}>
            <View style={styles.walletStar}>
              <Text style={styles.walletStarText}>★</Text>
            </View>
            <WalletIcon />
          </View>
          <View style={styles.walletPill}>
            <Text style={[styles.walletPillText, inter18('bold')]} numberOfLines={1}>
              {walletBalance}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={onNotificationPress}
          disabled={!onNotificationPress}
          style={styles.plainIconBtn}
          hitSlop={8}
          accessibilityLabel="Notifications">
          <BellIcon />
          <NotificationBadge count={notificationCount} />
        </Pressable>
      </View>
    </View>
  );
}

export default function AppScreenHeader(props: AppScreenHeaderProps) {
  if (props.variant === 'title') {
    return <TitleVariant {...props} />;
  }
  return <SearchVariant {...props} />;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },

  // ── title variant
  titleLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },

  screenTitle: {
    fontSize: 17,
    color: '#374151',
    flexShrink: 1,
  },

  titleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notifyBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  notifyBadgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    lineHeight: 11,
  },

  // ── search variant
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingRight: 12,
    paddingLeft: 4,
    gap: 4,
  },

  searchBarBack: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchBarTap: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },

  searchPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  searchRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  plainIconBtn: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  walletWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  walletCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  walletStar: {
    position: 'absolute',
    top: 2,
    left: 4,
    zIndex: 2,
  },

  walletStarText: {
    fontSize: 10,
    color: '#EAB308',
    lineHeight: 12,
  },

  walletPill: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 52,
    alignItems: 'center',
  },

  walletPillText: {
    fontSize: 9,
    color: '#FFFFFF',
  },
});

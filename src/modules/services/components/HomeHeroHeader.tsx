import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';
import HomeSearchBar from './HomeSearchBar';

export const HOME_GRADIENT_TOP = '#8B7CF6';
export const HOME_GRADIENT_BOTTOM = '#6A5AE0';
export const HOME_HERO_CURVE_RADIUS = 40;

// ─── Icons ───────────────────────────────────────────────────────────────────

function ChatIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M4 6.5C4 5.1 5.1 4 6.5 4H17.5C18.9 4 20 5.1 20 6.5V13.5C20 14.9 18.9 16 17.5 16H10L6.5 19V16C5.1 16 4 14.9 4 13.5V6.5Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.8"
      />
      <Circle cx="9" cy="10" fill="#FFFFFF" r="0.9" />
      <Circle cx="12" cy="10" fill="#FFFFFF" r="0.9" />
      <Circle cx="15" cy="10" fill="#FFFFFF" r="0.9" />
    </Svg>
  );
}

function BellIcon({ light = false }: { light?: boolean }) {
  const stroke = light ? '#FFFFFF' : '#111827';
  return (
    <Svg height={25} viewBox="0 0 24 24" width={25}>
      <Path
        d="M12 4.5C9.7 4.5 8 6.3 8 8.6V10.1C8 11.1 7.7 12.1 7.1 13L6 14.7V16H18V14.7L16.9 13C16.3 12.1 16 11.1 16 10.1V8.6C16 6.3 14.3 4.5 12 4.5Z"
        fill="none"
        stroke={stroke}
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <Path
        d="M10.1 18C10.4 19 11.1 19.5 12 19.5C12.9 19.5 13.6 19 13.9 18"
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </Svg>
  );
}

function CartIcon({ light = false }: { light?: boolean }) {
  const stroke = light ? '#FFFFFF' : '#111827';
  return (
    <Svg height={25} viewBox="0 0 24 24" width={25}>
      <Path
        d="M6 7h12l1 14H5L6 7z"
        stroke={stroke}
        strokeWidth="1.8"
        fill="none"
      />
      <Path
        d="M9 7V5a3 3 0 0 1 6 0v2"
        stroke={stroke}
        strokeWidth="1.8"
        fill="none"
      />
    </Svg>
  );
}

export function HomeHeroBackground({ variant = 'classic' }: { variant?: 'classic' | 'home' }) {
  if (variant === 'home') {
    return (
      <View pointerEvents="none" style={styles.heroBackground}>
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id="homeHeroGrad" x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0" stopColor={HOME_GRADIENT_TOP} />
              <Stop offset="0.55" stopColor="#7568E8" />
              <Stop offset="1" stopColor={HOME_GRADIENT_BOTTOM} />
            </LinearGradient>
          </Defs>
          <Rect fill="url(#homeHeroGrad)" height="100%" width="100%" x="0" y="0" />
        </Svg>
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={styles.heroBackground}>
      <Svg height="100%" width="100%">
        <Rect fill="#9E8DFF" height="100%" width="100%" x="0" y="0" />
      </Svg>
    </View>
  );
}

function HeroCurve({ fill = '#5E02AF', variant = 'classic' }: { fill?: string; variant?: 'classic' | 'home' }) {
  if (variant === 'home') {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.heroCurve}>
      <Svg height={56} width="100%" viewBox="0 0 430 46" preserveAspectRatio="none">
        <Path d="M0 2C110 14 260 17 430 0V14C300 35 130 38 0 28V2Z" fill={fill} />
        <Path d="M0 28C130 38 300 35 430 14V46H0V28Z" fill="#FFFFFF" />
      </Svg>
    </View>
  );
}

function CircleActionButton({
  onPress,
  accessibilityLabel,
  children,
  badge,
  buttonStyle,
}: {
  onPress?: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
  badge?: number;
  buttonStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={[styles.actionBtn, buttonStyle]}>
      {children}
      {badge != null && badge > 0 ? (
        <View style={styles.badge}>
          <Text style={[styles.badgeText, inter18('bold')]}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export type HomeHeroHeaderProps = {
  profileInitials?: string;
  profileImageUri?: string | null;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  onCartPress?: () => void;
  notificationCount?: number;
  cartItemCount?: number;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  showChatIcon?: boolean;
  showCart?: boolean;
  showHeroCopy?: boolean;
  showHeroCurve?: boolean;
  userName?: string;
  greeting?: string;
  goalSubtitle?: string;
  showSearchBar?: boolean;
  onSearchPress?: () => void;
  heroLayout?: 'classic' | 'home';
  /** Home scroll: sticky = header+search; cta = Ask MPS block; all = full hero */
  homePart?: 'sticky' | 'cta' | 'all';
  heroBackgroundColor?: string;
  /** When true, no local gradient/background — parent provides unified hero background */
  transparentBackground?: boolean;
};

export default function HomeHeroHeader({
  profileInitials = 'AJ',
  profileImageUri = null,
  onProfilePress,
  onNotificationPress,
  onCartPress,
  notificationCount = 1,
  cartItemCount,
  title = 'Ask MPS Connect',
  subtitle = 'Tell us how we can help you today',
  ctaLabel = 'Get Started',
  onCtaPress,
  showChatIcon = true,
  showCart = true,
  showHeroCopy = true,
  showHeroCurve = true,
  userName,
  greeting = 'Hi!',
  goalSubtitle = "What's your goal for today?",
  showSearchBar = false,
  onSearchPress,
  heroLayout = 'classic',
  homePart = 'all',
  heroBackgroundColor,
  transparentBackground = false,
}: HomeHeroHeaderProps) {
  const isCompact = !showHeroCopy;
  const isHomeLayout = heroLayout === 'home' && showHeroCopy;
  const isStickyPart = isHomeLayout && homePart === 'sticky';
  const isCtaPart = isHomeLayout && homePart === 'cta';

  const profileAvatar = (
    <Pressable
      onPress={onProfilePress}
      disabled={!onProfilePress}
      accessibilityLabel="Profile"
      hitSlop={8}
      style={isHomeLayout ? styles.profileWrapHome : isCompact ? styles.profilePressableCompact : styles.profileWrap}>
      {profileImageUri ? (
        <View style={isHomeLayout || isCompact ? styles.profileAvatarCompact : undefined}>
          <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
        </View>
      ) : (
        <View
          style={
            isHomeLayout
              ? styles.profileFallbackHome
              : isCompact
                ? styles.profileFallbackCompact
                : styles.profileFallback
          }>
          <Text
            style={[
              styles.profileInitials,
              inter18('bold'),
              (isHomeLayout || isCompact) && styles.profileInitialsCompact,
            ]}>
            {profileInitials}
          </Text>
        </View>
      )}
    </Pressable>
  );

  if (isStickyPart) {
    return (
      <View
        style={[
          styles.stickyHero,
          transparentBackground && styles.transparentHero,
          heroBackgroundColor != null && { backgroundColor: heroBackgroundColor },
        ]}>
        {!transparentBackground ? <HomeHeroBackground variant="home" /> : null}
        <View style={styles.stickyContent}>
          <View style={styles.heroTopRowHome}>
            <View style={styles.greetingBlockHome}>
              <Text style={[styles.greetingNameHome, inter18('bold')]}>
                {userName ? `${greeting.replace(/!?$/, '')}, ${userName}!` : greeting}
              </Text>
              <Text style={[styles.goalSubtitle, inter18('regular')]}>{goalSubtitle}</Text>
            </View>
            <View style={[styles.heroActions, styles.heroActionsHome]}>
              {profileAvatar}
              <CircleActionButton
                onPress={onNotificationPress}
                accessibilityLabel="Open notifications"
                badge={notificationCount}
                buttonStyle={styles.actionBtnHome}>
                <BellIcon light />
              </CircleActionButton>
              {showCart ? (
                <CircleActionButton
                  onPress={onCartPress}
                  accessibilityLabel="Open cart"
                  badge={cartItemCount}
                  buttonStyle={styles.actionBtnHome}>
                  <CartIcon light />
                </CircleActionButton>
              ) : null}
            </View>
          </View>
          {showSearchBar ? <HomeSearchBar compact onPress={onSearchPress} /> : null}
        </View>
      </View>
    );
  }

  if (isCtaPart) {
    return (
      <View style={[styles.ctaHero, transparentBackground && styles.transparentHero]}>
        {!transparentBackground ? <HomeHeroBackground variant="home" /> : null}
        <View style={styles.ctaContent}>
          <View style={styles.heroCopy}>
            <View style={styles.titleRow}>
              <Text style={[styles.heroTitle, inter18('bold')]}>{title}</Text>
              {showChatIcon ? <ChatIcon /> : null}
            </View>
            <Text style={[styles.heroSubtitle, inter18('medium')]}>{subtitle}</Text>
            {onCtaPress ? (
              <Pressable
                onPress={onCtaPress}
                style={[styles.heroButton, styles.heroButtonGlass, styles.heroButtonCta]}>
                <Text style={[styles.heroButtonText, inter18('bold')]}>{ctaLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
        {showHeroCurve && !transparentBackground ? (
          <HeroCurve variant="home" fill={HOME_GRADIENT_BOTTOM} />
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.hero,
        isCompact && styles.heroCompact,
        isHomeLayout && styles.heroHome,
        heroBackgroundColor != null && { backgroundColor: heroBackgroundColor },
      ]}>
      {!isCompact && !transparentBackground ? (
        <HomeHeroBackground variant={isHomeLayout ? 'home' : 'classic'} />
      ) : null}

      <View style={[styles.heroTopRow, isCompact && styles.heroTopRowCompact, isHomeLayout && styles.heroTopRowHome]}>
        {isHomeLayout ? (
          <View style={styles.greetingBlockHome}>
            <Text style={[styles.greetingNameHome, inter18('bold')]}>
              {userName ? `${greeting.replace(/!?$/, '')}, ${userName}!` : greeting}
            </Text>
            <Text style={[styles.goalSubtitle, inter18('regular')]}>{goalSubtitle}</Text>
          </View>
        ) : isCompact ? (
          <View style={styles.profileRowCompact}>
            {profileAvatar}
            {userName ? (
              <View style={styles.greetingBlock}>
                <Text style={[styles.greetingLabel, inter18('regular')]}>{greeting}</Text>
                <Text style={[styles.greetingName, inter18('bold')]}>{userName}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          profileAvatar
        )}

        <View style={[styles.heroActions, isCompact && styles.heroActionsCompact, isHomeLayout && styles.heroActionsHome]}>
          {isHomeLayout ? profileAvatar : null}
          <CircleActionButton
            onPress={onNotificationPress}
            accessibilityLabel="Open notifications"
            badge={notificationCount}
            buttonStyle={
              isHomeLayout
                ? styles.actionBtnHome
                : isCompact
                  ? styles.actionBtnExplore
                  : undefined
            }>
            <BellIcon light={isHomeLayout} />
          </CircleActionButton>

          {showCart ? (
            <CircleActionButton
              onPress={onCartPress}
              accessibilityLabel="Open cart"
              badge={cartItemCount}
              buttonStyle={isHomeLayout ? styles.actionBtnHome : undefined}>
              <CartIcon light={isHomeLayout} />
            </CircleActionButton>
          ) : null}
        </View>
      </View>

      {showSearchBar ? <HomeSearchBar onPress={onSearchPress} /> : null}

      {showHeroCopy ? (
        <View style={styles.heroCopy}>
          <View style={styles.titleRow}>
            <Text style={[styles.heroTitle, inter18('bold')]}>{title}</Text>
            {showChatIcon ? <ChatIcon /> : null}
          </View>

          <Text style={[styles.heroSubtitle, inter18('medium')]}>{subtitle}</Text>

          {onCtaPress ? (
            <Pressable onPress={onCtaPress} style={styles.heroButton}>
              <Text style={[styles.heroButtonText, inter18('bold')]}>{ctaLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {showHeroCurve ? (
        <HeroCurve
          fill={isHomeLayout ? HOME_GRADIENT_BOTTOM : '#5E02AF'}
          variant={isHomeLayout ? 'home' : 'classic'}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  transparentHero: {
    backgroundColor: 'transparent',
    overflow: 'visible',
  },

  stickyHero: {
    backgroundColor: HOME_GRADIENT_BOTTOM,
    overflow: 'hidden',
  },

  stickyContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },

  ctaHero: {
    position: 'relative',
    backgroundColor: HOME_GRADIENT_BOTTOM,
    overflow: 'visible',
    paddingBottom: 8,
  },

  ctaContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },

  hero: {
    position: 'relative',
    minHeight: 315,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#9E8DFF',
  },

  heroHome: {
    minHeight: 380,
    paddingBottom: 44,
    backgroundColor: HOME_GRADIENT_BOTTOM,
    overflow: 'visible',
  },

  heroCompact: {
    minHeight: 0,
    paddingTop: 4,
    paddingBottom: 8,
    overflow: 'visible',
  },

  heroBackground: {
    ...StyleSheet.absoluteFill,
  },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },

  heroTopRowCompact: {
    marginBottom: 0,
    marginTop: 0,
    minHeight: 48,
  },

  heroTopRowHome: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  profilePressableCompact: {
    justifyContent: 'center',
  },

  profileWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  profileWrapHome: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },

  profileFallbackHome: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileRowCompact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    marginRight: 12,
  },

  profileAvatarCompact: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  profileFallbackCompact: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#7C3AED',
  },

  profileInitialsCompact: {
    fontSize: 16,
  },

  greetingBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 2,
    marginLeft: 12,
  },

  greetingBlockHome: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 12,
  },

  greetingNameHome: {
    fontSize: 22,
    lineHeight: 28,
    color: '#FFFFFF',
  },

  goalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 4,
  },

  greetingLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4B5563',
  },

  greetingName: {
    fontSize: 20,
    lineHeight: 24,
    color: '#111827',
    marginTop: 2,
  },

  profileImage: {
    width: '100%',
    height: '100%',
  },

  profileFallback: {
    flex: 1,
    backgroundColor: '#1286B3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileInitials: {
    fontSize: 12,
    color: '#FFFFFF',
  },

  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  heroActionsCompact: {
    alignSelf: 'center',
  },

  heroActionsHome: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },

  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8DEFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  actionBtnExplore: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  actionBtnHome: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },

  badge: {
    position: 'absolute',
    top: -3,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4D6D',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    lineHeight: 11,
  },

  heroCopy: {
    alignItems: 'center',
    marginTop: 6,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    textAlign: 'center',
  },

  heroSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },

  heroButton: {
    alignSelf: 'center',
    backgroundColor: '#111111',
    borderRadius: 28,
    paddingHorizontal: 34,
    paddingVertical: 13,
    minWidth: 150,
    alignItems: 'center',
  },

  heroButtonGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    minWidth: 168,
    paddingHorizontal: 38,
    shadowColor: '#4C3D9E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 2,
  },

  heroButtonCta: {
    marginBottom: 8,
  },

  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },

  heroCurve: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -2,
  },

});

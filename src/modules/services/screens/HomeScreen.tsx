import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Path,
  Rect,
  SvgProps,
} from 'react-native-svg';

import PassportGdIcon from '../../../assets/images/icons/passport_gd.svg';
import PanGdIcon from '../../../assets/images/icons/id-card_gd.svg';
import AadhaarGdIcon from '../../../assets/images/icons/addhar_gd.svg';
import BikeGdIcon from '../../../assets/images/icons/motorbike_gd.svg';
import CarGdIcon from '../../../assets/images/icons/automobile_gd.svg';

import InsuranceCardIcon from '../../../assets/images/icons/insurance.svg';
import TaxCardIcon from '../../../assets/images/icons/tax_s.svg';
import MutualFundCardIcon from '../../../assets/images/icons/mutual_fund.svg';

import BottomHomeIcon from '../../../assets/images/icons/home_icon.svg';
import BottomRequestsIcon from '../../../assets/images/icons/shopping-bag.svg';
import BottomExploreIcon from '../../../assets/images/icons/navigation_icon.svg';
import BottomMoreIcon from '../../../assets/images/icons/bizz_logo.svg';

type HomeScreenProps = {
  onGetStarted?: () => void;
  onLogout?: () => void;
};

type SvgIconType = React.FC<SvgProps>;

function Icon({
  kind,
  color = '#3F3F46',
  size = 22,
}: {
  kind: 'chat' | 'bell' | 'chevron';
  color?: string;
  size?: number;
}) {
  if (kind === 'chat') {
    return (
      <Svg height={size} viewBox="0 0 24 24" width={size}>
        <Path
          d="M4 6.5C4 5.1 5.1 4 6.5 4H17.5C18.9 4 20 5.1 20 6.5V13.5C20 14.9 18.9 16 17.5 16H10L6.5 19V16C5.1 16 4 14.9 4 13.5V6.5Z"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
        />
        <Circle cx="9" cy="10" fill={color} r="0.9" />
        <Circle cx="12" cy="10" fill={color} r="0.9" />
        <Circle cx="15" cy="10" fill={color} r="0.9" />
      </Svg>
    );
  }

  if (kind === 'bell') {
    return (
      <Svg height={size} viewBox="0 0 24 24" width={size}>
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

  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M9 6L15 12L9 18"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
    </Svg>
  );
}

function SectionCard({
  title,
  children,
  compact = false,
  rightChevron = false,
  blueHeader = false,
}: {
  title?: string;
  children: React.ReactNode;
  compact?: boolean;
  rightChevron?: boolean;
  blueHeader?: boolean;
}) {
  return (
    <View style={[styles.card, compact ? styles.compactCard : undefined]}>
      {title ? (
        <View style={[styles.cardHeader, blueHeader ? styles.blueCardHeader : undefined]}>
          <Text style={styles.cardTitle}>{title}</Text>
          {rightChevron ? <Icon kind="chevron" color="#111111" size={22} /> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

function QuickService({
  IconComponent,
  label,
}: {
  IconComponent: SvgIconType;
  label: string;
}) {
  return (
    <View style={styles.quickItem}>
      <View style={styles.quickIconWrap}>
        <IconComponent width={34} height={34} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </View>
  );
}

function SmallCategory({
  IconComponent,
  label,
}: {
  IconComponent: SvgIconType;
  label: string;
}) {
  return (
    <View style={styles.smallCategory}>
      <Text style={styles.smallCategoryLabel}>{label}</Text>
      <View style={styles.smallIconWrap}>
        <IconComponent width={42} height={42} />
      </View>
    </View>
  );
}

function BottomTab({
  IconComponent,
  label,
  active = false,
  isSpecial = false,
}: {
  IconComponent: SvgIconType;
  label?: string;
  active?: boolean;
  isSpecial?: boolean;
}) {
  if (isSpecial) {
    return (
      <View style={styles.bottomTabItem}>
        <Pressable style={styles.specialTabButton}>
          <IconComponent width={44} height={32} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.bottomTabItem}>
      <Pressable style={[styles.bottomTabButton, active ? styles.bottomTabButtonActive : undefined]}>
        <IconComponent width={24} height={24} />
        <Text style={[styles.bottomTabText, active ? styles.bottomTabTextActive : undefined]}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

function HomeScreen({ onGetStarted }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.hero}>
          <View pointerEvents="none" style={styles.heroBackground}>
            <Svg height="100%" width="100%">
              <Rect fill="#9E8DFF" height="100%" width="100%" x="0" y="0" />
            </Svg>
          </View>

          <View style={styles.heroTopRow}>
            <View />
            <View style={styles.heroRight}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>AJ</Text>
              </View>

              <View style={styles.notifyWrap}>
                <View style={styles.notifyBubble}>
                  <Icon kind="bell" color="#111827" size={17} />
                </View>
                <View style={styles.notifyDot}>
                  <Text style={styles.notifyCount}>1</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.heroCopy}>
            <View style={styles.titleRow}>
              <Text style={styles.heroTitle}>Ask MPS Connect</Text>
              <Icon kind="chat" color="#FFFFFF" size={22} />
            </View>

            <Text style={styles.heroSubtitle}>
              Tell us how we can help you today
            </Text>

            <Pressable onPress={onGetStarted} style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Get Started</Text>
            </Pressable>
          </View>

          <View pointerEvents="none" style={styles.heroCurve}>
            <Svg
              height="56"
              width="100%"
              viewBox="0 0 430 46"
              preserveAspectRatio="none">
              <Path
                d="M0 2C110 14 260 17 430 0V14C300 35 130 38 0 28V2Z"
                fill="#5E02AF"
              />
              <Path
                d="M0 28C130 38 300 35 430 14V46H0V28Z"
                fill="#FFFFFF"
              />
            </Svg>
          </View>
        </View>

        <View style={styles.contentSheet}>
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>

            <SectionCard title="Your Active Requests" blueHeader>
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No active requests</Text>
              </View>
            </SectionCard>

            <SectionCard compact>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardStar}>⭐</Text>
                <View style={styles.rewardTextWrap}>
                  <Text style={styles.rewardTitle}>Rewards</Text>
                  <Text style={styles.rewardPoints}>1250 Points</Text>
                </View>
                <Icon kind="chevron" color="#111111" size={24} />
              </View>
            </SectionCard>

            <SectionCard title="Government Documents" rightChevron>
              <View style={styles.quickGrid}>
                <QuickService IconComponent={PassportGdIcon} label="Passport" />
                <QuickService IconComponent={PanGdIcon} label="PAN Card" />
                <QuickService IconComponent={AadhaarGdIcon} label={'Aadhaar\nCard'} />
                <QuickService IconComponent={BikeGdIcon} label={'2 wheeler\nLicense'} />
                <QuickService IconComponent={CarGdIcon} label={'4 wheeler\nLicense'} />
              </View>
            </SectionCard>

            <View style={styles.smallRow}>
              <SmallCategory IconComponent={InsuranceCardIcon} label="Insurance" />
              <SmallCategory IconComponent={TaxCardIcon} label="Tax Services" />
              <SmallCategory IconComponent={MutualFundCardIcon} label="Mutual Funds" />
            </View>
          </ScrollView>

          <View style={styles.tabBarWrap}>
            <View style={styles.tabBar}>
              <BottomTab IconComponent={BottomHomeIcon} label="Home" active />
              <BottomTab IconComponent={BottomRequestsIcon} label="My requests" />
              <BottomTab IconComponent={BottomExploreIcon} label="Explore" />
              <BottomTab IconComponent={BottomMoreIcon} isSpecial />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  hero: {
    position: 'relative',
    minHeight: 315,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#9E8DFF',
  },

  heroBackground: {
    ...StyleSheet.absoluteFill,
  },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 28,
  },

  heroRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1286B3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  notifyWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8DEFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  notifyBubble: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  notifyDot: {
    position: 'absolute',
    top: -3,
    right: -2,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#FF4D6D',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notifyCount: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
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
    fontWeight: '800',
    textAlign: 'center',
  },

  heroSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
  },

  heroButton: {
    alignSelf: 'center',
    backgroundColor: '#111111',
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 12,
    minWidth: 115,
    alignItems: 'center',
  },

  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  heroCurve: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -2,
  },

  contentSheet: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    overflow: 'visible',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 130,
    gap: 10,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    overflow: 'hidden',
    minHeight: 92,
  },

  compactCard: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 66,
    justifyContent: 'center',
  },

  cardHeader: {
    minHeight: 31,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingTop: 0,
    paddingBottom: 0,
  },

  blueCardHeader: {
    backgroundColor: '#E3F3FF',
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3F3F46',
  },

  emptyState: {
    backgroundColor: '#FFFFFF',
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 12,
    color: '#444444',
    fontStyle: 'italic',
  },

  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rewardStar: {
    fontSize: 28,
    marginRight: 10,
    color: '#F59E0B',
    fontWeight: '700',
  },

  rewardTextWrap: {
    flex: 1,
  },

  rewardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF8A00',
    marginBottom: 2,
  },

  rewardPoints: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
  },

  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 18,
  },

  quickItem: {
    width: '19%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  quickIconWrap: {
    height: 48,
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  quickLabel: {
    fontSize: 10.5,
    textAlign: 'center',
    color: '#333333',
    lineHeight: 13,
    fontWeight: '400',
  },

  smallRow: {
    flexDirection: 'row',
    gap: 7,
  },

  smallCategory: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    height: 112,
    alignItems: 'center',
    paddingTop: 14,
  },

  smallIconWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  smallCategoryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#555555',
    textAlign: 'center',
  },

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
    shadowOffset: {
      width: 0,
      height: 10,
    },
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
    fontWeight: '500',
    textAlign: 'center',
  },

  bottomTabTextActive: {
    fontWeight: '600',
  },

  specialTabButton: {
    width: '100%',
    minHeight: 60,
    borderRadius: 14,
    backgroundColor: '#EBDFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;

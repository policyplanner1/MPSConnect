import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Path,
  Rect,
  SvgProps,
} from 'react-native-svg';

import InsuranceCardIcon from '../../../assets/images/icons/insurance.svg';
import TaxCardIcon from '../../../assets/images/icons/tax_s.svg';
import MutualFundCardIcon from '../../../assets/images/icons/mutual_fund.svg';
import { inter18 } from '../../../core/theme/typography';
import { IMAGE_BASE_URL } from '../../../config/env';
import { ExploreScreen, type ExploreServiceItem } from '../../explore';
import HealthInsuranceStack from '../../healthInsurance/navigation/HealthInsuranceStack';
import AutoMarqueeScroll from '../components/AutoMarqueeScroll';
import HomeHeroHeader from '../components/HomeHeroHeader';
import ServicesBottomTabBar, {
  type ServicesMainTab,
} from '../components/ServicesBottomTabBar';
import { useServiceCart } from '../hooks/useServiceCart';
import { useGovernmentServices } from '../hooks/useServices';
import { useMyOrders } from '../hooks/useMyOrders';
import { useUserProfile } from '../hooks/useUserProfile';
import MyRequestsScreen from './MyRequestsScreen';

type HomeScreenProps = {
  onGetStarted?: () => void;
  onOpenNotifications?: () => void;
  onOpenCart?: () => void;
  onOpenRewards?: () => void;
  onOpenCalculators?: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  onServicePress?: (serviceId: number) => void;
  onOpenService?: (serviceId: number) => void;
  onGovernmentDocuments?: () => void;
  onInsurancePress?: () => void;
  initialRequestsParentOrderId?: string;
};

function CalculatorTileIcon({ width = 42, height = 42, color }: SvgProps) {
  const size = Math.min(Number(width) || 42, Number(height) || 42);
  const strokeColor = typeof color === 'string' ? color : '#555555';
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Rect
        fill="none"
        height="16"
        rx="2"
        stroke={strokeColor}
        strokeWidth="1.6"
        width="18"
        x="3"
        y="4"
      />
      <Path
        d="M7 8H10M7 11H10M7 14H10M13 8H17M13 11H17M13 14H15"
        stroke={strokeColor}
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </Svg>
  );
}

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
  flat = false,
  rightChevron = false,
  blueHeader = false,
  onHeaderPress,
}: {
  title?: string;
  children: React.ReactNode;
  compact?: boolean;
  flat?: boolean;
  rightChevron?: boolean;
  blueHeader?: boolean;
  onHeaderPress?: () => void;
}) {
  return (
    <View style={[styles.card, compact ? styles.compactCard : undefined, flat ? styles.flatCard : undefined]}>
      {title ? (
        <Pressable
          onPress={onHeaderPress}
          disabled={!onHeaderPress}
          style={[
            styles.cardHeader,
            blueHeader ? styles.blueCardHeader : undefined,
            flat ? styles.flatCardHeader : undefined,
          ]}>
          <Text style={[styles.cardTitle, inter18('bold')]}>{title}</Text>
          {rightChevron ? <Icon kind="chevron" color="#111111" size={22} /> : null}
        </Pressable>
      ) : null}
      {children}
    </View>
  );
}

function resolveServiceImage(uri: string | null | undefined): string | null {
  if (!uri || typeof uri !== 'string') {
    return null;
  }
  const trimmed = uri.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.startsWith('http')) {
    return trimmed;
  }
  const base = (IMAGE_BASE_URL ?? '').replace(/\/+$/, '');
  if (!base) {
    return trimmed;
  }
  return `${base}/${trimmed.replace(/^\//, '')}`;
}

function formatMoney(amount: number): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${Math.round(amount)}`;
  }
}

function isActiveOrder(statusRaw: string): boolean {
  const s = String(statusRaw || '').toLowerCase();
  // Treat these as "done" or "not actionable" in "Active Requests".
  if (s.includes('paid') || s === 'completed' || s === 'success') {
    return false;
  }
  if (s.includes('cancel') || s.includes('fail') || s.includes('reject')) {
    return false;
  }
  return true;
}

function QuickService({
  imageUri,
  label,
  onPress,
}: {
  imageUri: string | null;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickItem}>
      <View style={styles.quickIconCard}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.quickServiceImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.quickIconPlaceholder} />
        )}
      </View>
      <Text numberOfLines={2} style={[styles.quickLabel, inter18('medium')]}>{label}</Text>
    </Pressable>
  );
}

function FinancialServiceCard({
  IconComponent,
  label,
  onPress,
}: {
  IconComponent: SvgIconType;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.financialCard, pressed && { opacity: 0.88 }]}>
      <View style={styles.financialIconWrap}>
        <IconComponent width={46} height={46} />
      </View>
      <Text numberOfLines={2} style={[styles.financialLabel, inter18('medium')]}>{label}</Text>
    </Pressable>
  );
}

const FINANCIAL_SERVICES = [
  { id: 'insurance', label: 'Insurance', Icon: InsuranceCardIcon },
  { id: 'tax', label: 'Tax Services', Icon: TaxCardIcon },
  { id: 'mutual', label: 'Mutual Funds', Icon: MutualFundCardIcon },
  { id: 'planwealth', label: 'PlanWealth', Icon: CalculatorTileIcon },
] as const;

function HomeScreen({
  onGetStarted,
  onServicePress,
  onOpenService,
  onGovernmentDocuments,
  onInsurancePress,
  onOpenNotifications,
  onOpenCart,
  onOpenRewards,
  onOpenCalculators,
  onOpenProfile,
  initialRequestsParentOrderId,
}: HomeScreenProps) {
  const [mainTab, setMainTab] = React.useState<ServicesMainTab>('home');
  const [exploreOverlay, setExploreOverlay] = React.useState<'healthInsurance' | null>(null);
  const { services: govServices, loading: govLoading } = useGovernmentServices();
  const { items: cartItems } = useServiceCart();
  const { orders, loading: myOrdersLoading } = useMyOrders();
  const { profile, initials } = useUserProfile();
  const activeRequestsRef = React.useRef<ScrollView | null>(null);
  const [activeRequestsIndex, setActiveRequestsIndex] = React.useState(0);

  const showExplore = mainTab === 'explore';
  const showRequests = mainTab === 'requests';
  const showExploreHealthInsurance = showExplore && exploreOverlay === 'healthInsurance';

  const activeParentOrders = React.useMemo(
    () => orders.filter(o => isActiveOrder(o.status)),
    [orders],
  );

  const activeCarouselLayout = React.useMemo(() => {
    const windowWidth = Dimensions.get('window').width;
    const outerPadding = 16; // scrollContent paddingHorizontal
    const innerPadding = 11; // activeRequestsWrap paddingHorizontal
    const gap = 10;
    const itemWidth = Math.max(280, windowWidth - outerPadding * 2 - innerPadding * 2);
    const snapInterval = itemWidth + gap;
    return { itemWidth, gap, snapInterval };
  }, []);

  React.useEffect(() => {
    if (showExplore || showRequests || showExploreHealthInsurance) {
      return;
    }
    if (activeParentOrders.length <= 1) {
      setActiveRequestsIndex(0);
      return;
    }

    const id = setInterval(() => {
      setActiveRequestsIndex(prev => {
        const next = (prev + 1) % activeParentOrders.length;
        activeRequestsRef.current?.scrollTo({
          x: next * activeCarouselLayout.snapInterval,
          animated: true,
        });
        return next;
      });
    }, 3500);

    return () => clearInterval(id);
  }, [
    activeParentOrders.length,
    activeCarouselLayout.snapInterval,
    showExplore,
    showExploreHealthInsurance,
    showRequests,
  ]);

  const handleMainTabPress = (tab: ServicesMainTab) => {
    if (tab !== 'explore') {
      setExploreOverlay(null);
    }
    setMainTab(tab);
  };

  React.useEffect(() => {
    if (initialRequestsParentOrderId) {
      setMainTab('requests');
    }
  }, [initialRequestsParentOrderId]);

  const handleExploreServicePress = (_service: ExploreServiceItem) => {
    // Reserved for future explore → service detail / CRM routes.
  };

  const displayName = profile?.name?.trim().split(/\s+/)[0] ?? 'there';
  const activeFocusTitle =
    activeParentOrders.length > 0
      ? `${activeParentOrders.length} ACTIVE FOCUS ITEM${activeParentOrders.length > 1 ? 'S' : ''}`
      : 'ACTIVE FOCUS ITEMS';

  const handleFinancialPress = (id: string) => {
    if (id === 'insurance') {
      onInsurancePress?.();
      return;
    }
    if (id === 'planwealth') {
      onOpenCalculators?.();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        {showExploreHealthInsurance ? (
          <HealthInsuranceStack onBack={() => setExploreOverlay(null)} />
        ) : showExplore ? (
          <ExploreScreen
            onOpenNotifications={onOpenNotifications}
            onProfilePress={onOpenProfile}
            onReferPress={onOpenRewards}
            onServicePress={handleExploreServicePress}
            onHealthInsurancePress={() => setExploreOverlay('healthInsurance')}
            profileInitials={initials}
            userName={profile?.name}
          />
        ) : showRequests ? (
          <MyRequestsScreen
            onOpenNotifications={onOpenNotifications}
            onOpenCart={onOpenCart}
            onOpenService={onOpenService}
            cartItemCount={cartItems.length > 0 ? cartItems.length : undefined}
            profileInitials={initials}
            onProfilePress={onOpenProfile}
            userName={profile?.name}
            initialParentOrderId={initialRequestsParentOrderId}
          />
        ) : (
          <>
            <ScrollView
              bounces
              stickyHeaderIndices={[0]}
              style={styles.homeScroll}
              contentContainerStyle={styles.homeScrollContent}
              showsVerticalScrollIndicator={false}>
              <View style={styles.stickyHeroShell}>
                <HomeHeroHeader
                  profileInitials={initials}
                  userName={displayName}
                  heroLayout="home"
                  homePart="sticky"
                  showSearchBar
                  onProfilePress={onOpenProfile}
                  onNotificationPress={onOpenNotifications}
                  onCartPress={onOpenCart}
                  notificationCount={1}
                  cartItemCount={cartItems.length > 0 ? cartItems.length : undefined}
                />
              </View>

              <HomeHeroHeader
                homePart="cta"
                heroLayout="home"
                onCtaPress={onGetStarted}
              />

              <View style={styles.activeFocusOverlap}>
                <SectionCard
                  title={activeFocusTitle}
                  blueHeader
                  rightChevron
                  onHeaderPress={() => handleMainTabPress('requests')}>
                  {myOrdersLoading ? (
                    <View style={styles.emptyState}>
                      <ActivityIndicator size="small" color="#5E02AF" />
                    </View>
                  ) : activeParentOrders.length === 0 ? (
                    <View style={styles.focusEmptyCard}>
                      <View style={styles.focusIconBox}>
                        <Text style={styles.focusIconEmoji}>📋</Text>
                      </View>
                      <View style={styles.focusTextCol}>
                        <Text style={[styles.focusTitle, inter18('bold')]}>No pending tasks</Text>
                        <Text style={[styles.focusSubtitle, inter18('regular')]}>
                          Your active service requests will appear here
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.activeRequestsWrap}>
                      <ScrollView
                        ref={activeRequestsRef}
                        horizontal
                        pagingEnabled
                        snapToInterval={activeCarouselLayout.snapInterval}
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: activeCarouselLayout.gap }}
                        onMomentumScrollEnd={e => {
                          const x = e.nativeEvent.contentOffset.x;
                          const next = Math.round(x / activeCarouselLayout.snapInterval);
                          setActiveRequestsIndex(next);
                        }}>
                        {activeParentOrders.map(order => {
                          const previewName =
                            order.preview?.[0]?.name ??
                            order.items?.[0]?.service_name ??
                            'Service request';
                          const imageUri = resolveServiceImage(order.items?.[0]?.image_url);
                          const subtitle =
                            order.summary?.total_items != null
                              ? `${order.summary.total_items} item${
                                  order.summary.total_items > 1 ? 's' : ''
                                } in progress`
                              : 'Tap to view details';

                          return (
                            <Pressable
                              key={order.parent_order_id}
                              onPress={() => handleMainTabPress('requests')}
                              style={({ pressed }) => [
                                styles.focusCard,
                                { width: activeCarouselLayout.itemWidth, marginRight: activeCarouselLayout.gap },
                                pressed && { opacity: 0.92 },
                              ]}>
                              <View style={styles.focusIconBox}>
                                {imageUri ? (
                                  <Image
                                    source={{ uri: imageUri }}
                                    style={styles.focusThumbImg}
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <Text style={styles.focusIconEmoji}>📄</Text>
                                )}
                              </View>
                              <View style={styles.focusTextCol}>
                                <Text
                                  style={[styles.focusTitle, inter18('bold')]}
                                  numberOfLines={1}>
                                  {previewName}
                                </Text>
                                <Text
                                  style={[styles.focusSubtitle, inter18('regular')]}
                                  numberOfLines={2}>
                                  {subtitle}
                                </Text>
                                <Text style={[styles.focusAmount, inter18('semiBold')]}>
                                  {formatMoney(order.total_amount)}
                                </Text>
                              </View>
                              <Icon kind="chevron" color="#9CA3AF" size={22} />
                            </Pressable>
                          );
                        })}
                      </ScrollView>

                      {activeParentOrders.length > 1 ? (
                        <View style={styles.activeDots}>
                          {activeParentOrders.map((_, i) => (
                            <View
                              key={i}
                              style={[
                                styles.activeDot,
                                i === activeRequestsIndex && styles.activeDotActive,
                              ]}
                            />
                          ))}
                        </View>
                      ) : null}
                    </View>
                  )}
                </SectionCard>
              </View>

              <View style={styles.scrollSections}>
                <SectionCard compact>
                  <Pressable
                    accessibilityLabel="Open rewards"
                    onPress={onOpenRewards}
                    style={styles.rewardRow}>
                    <Text style={styles.rewardStar}>⭐</Text>
                    <View style={styles.rewardTextWrap}>
                      <Text style={[styles.rewardTitle, inter18('bold')]}>REWARDS</Text>
                      <Text style={[styles.rewardPoints, inter18('bold')]}>1250 Points Available</Text>
                    </View>
                    <Icon kind="chevron" color="#111111" size={24} />
                  </Pressable>
                </SectionCard>

                <SectionCard
                  title="Government Documents"
                  rightChevron
                  onHeaderPress={onGovernmentDocuments}>
                  {govLoading ? (
                    <View style={[styles.loadingContainer, styles.flatSectionBody]}>
                      <ActivityIndicator size="small" color="#9E8DFF" />
                    </View>
                  ) : govServices.length === 0 ? (
                    <View style={[styles.emptyState, styles.flatSectionBody]}>
                      <Text style={[styles.emptyText, inter18('regular')]}>No services available</Text>
                    </View>
                  ) : (
                    <AutoMarqueeScroll
                      speed={0.35}
                      gap={14}
                      contentContainerStyle={styles.marqueeContent}>
                      {govServices.map(service => (
                        <QuickService
                          key={service.id}
                          imageUri={resolveServiceImage(service.service_image)}
                          label={service.name}
                          onPress={() => onServicePress?.(service.id)}
                        />
                      ))}
                    </AutoMarqueeScroll>
                  )}
                </SectionCard>

                <SectionCard title="Financial Services" rightChevron>
                  <AutoMarqueeScroll
                    speed={0.32}
                    gap={12}
                    contentContainerStyle={styles.marqueeContentFinancial}>
                    {FINANCIAL_SERVICES.map(item => (
                      <FinancialServiceCard
                        key={item.id}
                        IconComponent={item.Icon}
                        label={item.label}
                        onPress={() => handleFinancialPress(item.id)}
                      />
                    ))}
                  </AutoMarqueeScroll>
                </SectionCard>
              </View>
            </ScrollView>
          </>
        )}

        {!showExploreHealthInsurance ? (
          <ServicesBottomTabBar activeTab={mainTab} onTabPress={handleMainTabPress} />
        ) : null}
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

  homeScroll: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  homeScrollContent: {
    paddingBottom: 130,
    backgroundColor: '#F7F7F7',
  },

  stickyHeroShell: {
    backgroundColor: '#6A5AE0',
    zIndex: 20,
    elevation: 12,
  },

  activeFocusOverlap: {
    marginTop: -22,
    marginHorizontal: 16,
    marginBottom: 8,
    zIndex: 5,
    elevation: 8,
  },

  scrollSections: {
    paddingHorizontal: 16,
    gap: 14,
    paddingTop: 4,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    overflow: 'hidden',
    minHeight: 92,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  compactCard: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 66,
    justifyContent: 'center',
  },

  flatCard: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    marginHorizontal: -16,
    minHeight: 0,
  },

  cardHeader: {
    minHeight: 38,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  flatCardHeader: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
  },

  blueCardHeader: {
    backgroundColor: '#E3F3FF',
  },
  
  flatSectionBody: {
    backgroundColor: 'transparent',
  },

  cardTitle: {
    fontSize: 12,
    color: '#1E3A5F',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
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
  },

  rewardTextWrap: {
    flex: 1,
  },

  rewardTitle: {
    fontSize: 11,
    color: '#FF8A00',
    marginBottom: 3,
    letterSpacing: 0.3,
  },

  rewardPoints: {
    fontSize: 14,
    color: '#111827',
  },

  marqueeContent: {
    paddingHorizontal: 14,
    paddingTop:12,
    paddingBottom:14,
  },

  marqueeContentFinancial: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
  },

  quickItem: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  quickIconCard: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  quickServiceImage: {
    width: 42,
    height: 42,
  },

  quickIconPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },

  quickLabel: {
    fontSize: 11,
    textAlign: 'center',
    color: '#374151',
    lineHeight: 14,
  },

  loadingContainer: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },

  financialCard: {
    width: 96,
    height: 128,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    alignItems: 'center',
    paddingTop: 14,
    paddingHorizontal: 4,
    paddingVertical: 4,
    justifyContent: "flex-start",
  },

  financialLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },

  financialIconWrap: {
    flex: 1,
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#E8EDF3",
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeRequestsWrap: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },

  focusCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  focusEmptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },

  focusIconBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  focusIconEmoji: {
    fontSize: 24,
  },

  focusThumbImg: {
    width: '100%',
    height: '100%',
  },

  focusTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  focusTitle: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 18,
  },

  focusSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },

  focusAmount: {
    fontSize: 13,
    color: '#5E02AF',
    marginTop: 2,
  },
  activeDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  activeDotActive: {
    width: 22,
    backgroundColor: '#5E02AF',
  },

});

export default HomeScreen;

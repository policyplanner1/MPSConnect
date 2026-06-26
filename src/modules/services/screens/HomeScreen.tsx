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

import AdharCardIcon from '../../../assets/images/adhar card.svg';
import CarIcon from '../../../assets/images/Car.svg';
import DomicileIcon from '../../../assets/images/domicile.svg';
import MarriageIcon from '../../../assets/images/marriage.svg';
import RentAgreementIcon from '../../../assets/images/rent aggrement.svg';
import TwoWheelIcon from '../../../assets/images/2 wheel.svg';
import TwoFourWheelIcon from '../../../assets/images/two&four wheel.svg';
import PanCardIcon from '../../../assets/images/pan card.svg';
import PassportIcon from '../../../assets/images/passport.svg';
import CertificateIcon from '../../../assets/images/icons/id-card_gd.svg';
import InsuranceCardIcon from '../../../assets/images/icons/insurance.svg';
import TaxCardIcon from '../../../assets/images/icons/tax_s.svg';
import MutualFundCardIcon from '../../../assets/images/icons/mutual_fund.svg';
import { inter18 } from '../../../core/theme/typography';
import { IMAGE_BASE_URL } from '../../../config/env';
import { ExploreScreen, type ExploreServiceItem } from '../../explore';
import HealthInsuranceStack from '../../healthInsurance/navigation/HealthInsuranceStack';
import AutoMarqueeScroll from '../components/AutoMarqueeScroll';
import HomeHeroHeader, {
  HOME_GRADIENT_TOP,
  HOME_HERO_CURVE_RADIUS,
  HomeHeroBackground,
} from '../components/HomeHeroHeader';
import ServicesBottomTabBar, {
  type ServicesMainTab,
} from '../components/ServicesBottomTabBar';
import { useServiceCart } from '../hooks/useServiceCart';
import { useGovernmentServices } from '../hooks/useServices';
import { useMyOrders } from '../hooks/useMyOrders';
import { useUserProfile } from '../hooks/useUserProfile';
import MyRequestsScreen from './MyRequestsScreen';
import { isActiveOrder } from '../utils/orderStatus';

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
  onTaxServicesPress?: () => void;
  onOpenDocVault?: () => void;
  initialRequestsParentOrderId?: string;
};

function LockIcon({ size = 22, color = '#38BDF8' }: { size?: number; color?: string }) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <Rect
        fill="none"
        height="10"
        rx="2"
        stroke={color}
        strokeWidth="1.8"
        width="14"
        x="5"
        y="11"
      />
      <Path d="M12 14v3" stroke={color} strokeLinecap="round" strokeWidth="1.8" />
    </Svg>
  );
}

function DocVaultHomeSection({ onPress }: { onPress?: () => void }) {
  return (
    <View style={styles.docVaultSection}>
      <View style={styles.docVaultHeader}>
        <View style={styles.docVaultHeaderText}>
          <Text style={[styles.docVaultTitle, inter18('bold')]}>DocVault</Text>
          <Text style={[styles.docVaultSubtitle, inter18('regular')]}>
            Your encrypted personal storage
          </Text>
        </View>
        <Pressable
          onPress={onPress}
          disabled={!onPress}
          style={({ pressed }) => [styles.accessVaultBtn, pressed && { opacity: 0.9 }]}>
          <Text style={[styles.accessVaultText, inter18('semiBold')]}>Access Vault</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [styles.docVaultCard, pressed && { opacity: 0.94 }]}>
        <View style={styles.docVaultIconWrap}>
          <LockIcon size={24} color="#38BDF8" />
        </View>
        <View style={styles.docVaultCardText}>
          <Text style={[styles.docVaultCardTitle, inter18('bold')]}>Secure Storage</Text>
          <Text style={[styles.docVaultCardSub, inter18('regular')]}>48 Documents Protected</Text>
        </View>
        <Icon kind="chevron" color="#9CA3AF" size={22} />
      </Pressable>
    </View>
  );
}

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

type GovernmentServiceIcon = {
  IconComponent: SvgIconType;
};

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
  activeFocus = false,
  rightChevron = false,
  blueHeader = false,
  onHeaderPress,
}: {
  title?: string;
  children: React.ReactNode;
  compact?: boolean;
  flat?: boolean;
  activeFocus?: boolean;
  rightChevron?: boolean;
  blueHeader?: boolean;
  onHeaderPress?: () => void;
}) {
  return (
    <View
      style={[
        styles.card,
        compact ? styles.compactCard : undefined,
        flat ? styles.flatCard : undefined,
        activeFocus ? styles.activeFocusSectionCard : undefined,
      ]}>
      {title ? (
        <Pressable
          onPress={onHeaderPress}
          disabled={!onHeaderPress}
          style={[
            styles.cardHeader,
            flat ? styles.flatCardHeader : undefined,
            blueHeader ? styles.blueCardHeader : undefined,
            flat && !blueHeader ? styles.flatCardHeaderTransparent : undefined,
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

function resolveGovernmentServiceIcon(name: string): GovernmentServiceIcon | null {
  const normalized = name.toLowerCase();

  if (normalized.includes('pan')) {
    return { IconComponent: PanCardIcon };
  }
  if (
    normalized.includes('aadhaar') ||
    normalized.includes('aadhar') ||
    normalized.includes('adhar')
  ) {
    return { IconComponent: AdharCardIcon };
  }
  if (normalized.includes('passport')) {
    return { IconComponent: PassportIcon };
  }

  const hasTwoWheel =
    normalized.includes('2 wheel') ||
    normalized.includes('two wheel') ||
    normalized.includes('two-wheel') ||
    normalized.includes('twowheel') ||
    normalized.includes('two wheeler') ||
    normalized.includes('2-wheeler') ||
    normalized.includes('bike') ||
    normalized.includes('motorbike') ||
    normalized.includes('scooter') ||
    normalized.includes('motorcycle');

  const hasFourWheel =
    normalized.includes('4 wheel') ||
    normalized.includes('four wheel') ||
    normalized.includes('four-wheel') ||
    normalized.includes('fourwheel') ||
    normalized.includes('four wheeler') ||
    normalized.includes('4-wheeler') ||
    normalized.includes('automobile') ||
    (normalized.includes('car') && !normalized.includes('card'));

  const hasCombinedTwoFour =
    normalized.includes('two&four') ||
    normalized.includes('two & four') ||
    normalized.includes('2&4') ||
    normalized.includes('2 & 4') ||
    normalized.includes('2 and 4') ||
    normalized.includes('two and four') ||
    (hasTwoWheel && hasFourWheel);

  if (hasCombinedTwoFour) {
    return { IconComponent: TwoFourWheelIcon };
  }
  if (hasTwoWheel) {
    return { IconComponent: TwoWheelIcon };
  }
  if (
    hasFourWheel ||
    normalized.includes('driving license') ||
    normalized.includes('driving licence')
  ) {
    return { IconComponent: CarIcon };
  }
  if (normalized.includes('rent')) {
    return { IconComponent: RentAgreementIcon };
  }
  if (normalized.includes('marriage')) {
    return { IconComponent: MarriageIcon };
  }
  if (normalized.includes('domicile')) {
    return { IconComponent: DomicileIcon };
  }
  if (
    normalized.includes('certificate') ||
    normalized.includes('birth') ||
    normalized.includes('income') ||
    normalized.includes('caste') ||
    normalized.includes('encumbrance') ||
    normalized.includes('affidavit')
  ) {
    return { IconComponent: CertificateIcon };
  }

  return null;
}

function QuickService({
  imageUri,
  IconComponent,
  label,
  onPress,
}: {
  imageUri: string | null;
  IconComponent?: SvgIconType | null;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickItem}>
      <View style={styles.quickIconCard}>
        {IconComponent ? (
          <IconComponent width={42} height={42} />
        ) : imageUri ? (
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

function FinancialServiceItem({
  IconComponent,
  label,
  onPress,
}: {
  IconComponent: SvgIconType;
  label: string;
  onPress?: () => void;
}) {
  return (
    <QuickService
      IconComponent={IconComponent}
      imageUri={null}
      label={label}
      onPress={onPress}
    />
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
  onTaxServicesPress,
  onOpenDocVault,
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
    () => orders.filter(isActiveOrder),
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
    if (id === 'tax') {
      onTaxServicesPress?.();
      return;
    }
    if (id === 'planwealth') {
      onOpenCalculators?.();
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        !showExplore && !showRequests && !showExploreHealthInsurance && styles.safeAreaHome,
      ]}
      edges={['top', 'left', 'right']}>
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
              style={styles.homeScroll}
              contentContainerStyle={styles.homeScrollContent}
              showsVerticalScrollIndicator={false}>
              <View style={styles.homeHeroBlock}>
                <View style={styles.homeHeroBackgroundClip}>
                  <HomeHeroBackground variant="home" />
                </View>

                <View style={styles.homeHeroContent}>
                  <HomeHeroHeader
                    profileInitials={initials}
                    userName={displayName}
                    heroLayout="home"
                    homePart="sticky"
                    showSearchBar
                    transparentBackground
                    onProfilePress={onOpenProfile}
                    onNotificationPress={onOpenNotifications}
                    onCartPress={onOpenCart}
                    notificationCount={1}
                    cartItemCount={cartItems.length > 0 ? cartItems.length : undefined}
                  />

                  <HomeHeroHeader
                    homePart="cta"
                    heroLayout="home"
                    transparentBackground
                    showHeroCurve={false}
                    onCtaPress={onGetStarted}
                  />
                </View>
              </View>

              <View style={styles.activeFocusOverlap}>
                <SectionCard
                  activeFocus
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
                <DocVaultHomeSection onPress={onOpenDocVault} />

                <SectionCard
                  flat
                  title="Government Documents"
                  rightChevron
                  onHeaderPress={onGovernmentDocuments}>
                  {govLoading ? (
                    <View style={[styles.loadingContainer, styles.flatSectionBody]}>
                      <ActivityIndicator size="small" color="#9E8DFF" />
                    </View>
                  ) : govServices.length === 0 ? (
                    <View style={[styles.emptyState, styles.emptyStateFlat]}>
                      <Text style={[styles.emptyText, inter18('regular')]}>No services available</Text>
                    </View>
                  ) : (
                    <AutoMarqueeScroll
                      speed={0.35}
                      gap={14}
                      contentContainerStyle={styles.marqueeContentFlat}>
                      {govServices.map(service => {
                        const govIcon = resolveGovernmentServiceIcon(service.name);

                        return (
                          <QuickService
                            key={service.id}
                            IconComponent={govIcon?.IconComponent}
                            imageUri={resolveServiceImage(service.service_image)}
                            label={service.name}
                            onPress={() => onServicePress?.(service.id)}
                          />
                        );
                      })}
                    </AutoMarqueeScroll>
                  )}
                </SectionCard>

                <SectionCard flat title="Financial Services" rightChevron>
                  <AutoMarqueeScroll
                    speed={0.32}
                    gap={14}
                    contentContainerStyle={styles.marqueeContentFlat}>
                    {FINANCIAL_SERVICES.map(item => (
                      <FinancialServiceItem
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

  safeAreaHome: {
    backgroundColor: HOME_GRADIENT_TOP,
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

  homeHeroBlock: {
    position: 'relative',
    marginBottom: -18,
    zIndex: 2,
  },

  homeHeroBackgroundClip: {
    ...StyleSheet.absoluteFill,
    borderBottomLeftRadius: HOME_HERO_CURVE_RADIUS,
    borderBottomRightRadius: HOME_HERO_CURVE_RADIUS,
    overflow: 'hidden',
  },

  homeHeroContent: {
    position: 'relative',
    zIndex: 1,
    paddingBottom: 22,
  },

  activeFocusOverlap: {
    marginTop: -8,
    marginHorizontal: 16,
    marginBottom: 8,
    zIndex: 5,
  },

  scrollSections: {
    paddingHorizontal: 16,
    gap: 14,
    paddingTop: 4,
  },

  docVaultSection: {
    gap: 12,
  },

  docVaultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },

  docVaultHeaderText: {
    flex: 1,
    gap: 4,
  },

  docVaultTitle: {
    fontSize: 22,
    color: '#111827',
    lineHeight: 28,
  },

  docVaultSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },

  accessVaultBtn: {
    backgroundColor: '#E8F0FE',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 2,
  },

  accessVaultText: {
    fontSize: 12,
    color: '#1D4ED8',
  },

  docVaultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    paddingHorizontal: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  docVaultIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  docVaultCardText: {
    flex: 1,
    gap: 4,
  },

  docVaultCardTitle: {
    fontSize: 16,
    color: '#111827',
  },

  docVaultCardSub: {
    fontSize: 13,
    color: '#6B7280',
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
    marginHorizontal: 0,
    minHeight: 0,
  },

  activeFocusSectionCard: {
    borderRadius: 22,
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    overflow: 'hidden',
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
    paddingHorizontal: 0,
    paddingVertical: 6,
    minHeight: 0,
  },

  flatCardHeaderTransparent: {
    backgroundColor: 'transparent',
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

  emptyStateFlat: {
    backgroundColor: 'transparent',
  },

  emptyText: {
    fontSize: 12,
    color: '#444444',
    fontStyle: 'italic',
  },

  marqueeContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },

  marqueeContentFlat: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 4,
  },

  quickItem: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  quickIconCard: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
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

  activeRequestsWrap: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },

  focusCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    borderRadius: 18,
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

import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import AppScreenHeader from '../../../components/AppScreenHeader';
import TopPicksCarousel from '../components/TopPicksCarousel';
import ServiceAddressPickerModal from '../components/ServiceAddressPickerModal';
import ServiceDeliveryAddressBar from '../components/ServiceDeliveryAddressBar';
import { inter18 } from '../../../core/theme/typography';
import {
  fetchBuyNowCheckoutPreview,
  fetchCartCheckoutPreview,
  filterCheckoutPreviewForSelection,
  getCheckoutPreviewItems,
  getServiceCartErrorMessage,
  removeServiceCartItem,
} from '../api/serviceCartApi';
import { useServiceCart } from '../hooks/useServiceCart';
import { useServiceAddresses } from '../hooks/useServiceAddresses';
import { useUserProfile } from '../hooks/useUserProfile';
import { CheckoutPreviewData, ServiceCartLineItem } from '../types/cart.types';

type Props = {
  onBack: () => void;
  onOpenNotifications?: () => void;
  onProceedToCheckout?: (preview: CheckoutPreviewData) => void;
};

// ─── Icons ───────────────────────────────────────────────────────────────────

function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Rect
        x="1"
        y="1"
        width="20"
        height="20"
        rx="4"
        stroke={checked ? '#2563EB' : '#D1D5DB'}
        strokeWidth="2"
        fill={checked ? '#2563EB' : '#FFFFFF'}
      />
      {checked ? (
        <Path
          d="M6 11L9.5 14.5L16 8"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ) : null}
    </Svg>
  );
}

function TrashIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
        stroke="#6B7280"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function SparkleIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z"
        fill="#6D28D9"
      />
    </Svg>
  );
}

function TagIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M20 12l-8 8-10-10V2h8l10 10z"
        stroke="#6D28D9"
        strokeWidth="1.8"
        fill="none"
      />
      <Circle cx="7" cy="7" r="1.5" fill="#6D28D9" />
    </Svg>
  );
}

function CoinIcon() {
  return (
    <View style={styles.coinIconWrap}>
      <Text style={styles.coinIconStar}>★</Text>
    </View>
  );
}

function CheckGreenIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 22 22">
      <Circle cx="11" cy="11" r="11" fill="#22C55E" />
      <Path
        d="M6 11L9.5 14.5L16 8"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function ArrowRightIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// ─── Static placeholders (wire to API / profile later) ───────────────────────

const STATIC_COUPON = {
  code: 'FIRSTBUY20',
  hint: 'Add more items to avail this offer',
};

const STATIC_RECOMMENDATIONS = [
  { id: 'r1', title: 'Marriage Certificate', price: 3700, description: 'Official registration support' },
  { id: 'r2', title: 'PAN Card Update', price: 899, description: 'Name change after marriage' },
  { id: 'r3', title: 'Aadhaar Name Update', price: 499, description: 'Quick document assistance' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CartItemCard({
  item,
  selected,
  onToggle,
  onRemove,
  onBuyNow,
  isRemoving,
  isBuyingNow,
}: {
  item: ServiceCartLineItem;
  selected: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onBuyNow: () => void;
  isRemoving: boolean;
  isBuyingNow: boolean;
}) {
  const savings = Math.max(0, item.originalPrice - item.price);
  const showSavings = savings > 0;

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemPromoRibbon}>
        <Text style={[styles.itemPromoText, inter18('medium')]}>
          ⭐ Save ₹500 more with coins
        </Text>
      </View>

      <View style={styles.itemBody}>
        <Pressable onPress={onToggle} hitSlop={8}>
          <CheckboxIcon checked={selected} />
        </Pressable>

        <View style={styles.itemImagePlaceholder} />

        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, inter18('bold')]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.itemDesc, inter18('regular')]} numberOfLines={2}>
            {item.description}
            {item.quantity > 1 ? ` · Qty ${item.quantity}` : ''}
          </Text>
          <View style={styles.itemPriceRow}>
            <Text style={[styles.itemPrice, inter18('bold')]}>₹{item.price.toFixed(0)}</Text>
            {showSavings ? (
              <Text style={[styles.itemOriginalPrice, inter18('regular')]}>
                ₹{item.originalPrice.toFixed(0)}
              </Text>
            ) : null}
            {showSavings ? (
              <View style={styles.saveTag}>
                <Text style={[styles.saveTagText, inter18('medium')]}>Save ₹{savings}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.itemActions}>
        <Pressable
          style={[styles.itemActionBtn, isRemoving && styles.itemActionBtnDisabled]}
          onPress={onRemove}
          disabled={isRemoving}>
          {isRemoving ? (
            <ActivityIndicator size="small" color="#6B7280" />
          ) : (
            <TrashIcon />
          )}
          <Text style={[styles.itemActionText, inter18('medium')]}>Remove Item</Text>
        </Pressable>
        <View style={styles.itemActionDivider} />
        <Pressable
          style={[styles.itemActionBtn, isBuyingNow && styles.itemActionBtnDisabled]}
          onPress={onBuyNow}
          disabled={isRemoving || isBuyingNow}>
          {isBuyingNow ? (
            <ActivityIndicator size="small" color="#6D28D9" />
          ) : (
            <SparkleIcon />
          )}
          <Text style={[styles.itemActionText, inter18('medium')]}>Buy This Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

function BillRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.billRow}>
      <Text style={[styles.billLabel, inter18('regular')]}>{label}</Text>
      <Text
        style={[
          styles.billValue,
          inter18('medium'),
          highlight ? styles.billValueGreen : null,
        ]}>
        {value}
      </Text>
    </View>
  );
}

function RecommendationCarousel({ title }: { title: string }) {
  return (
    <View style={styles.recSection}>
      <Text style={[styles.sectionTitle, inter18('bold')]}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recScroll}>
        {STATIC_RECOMMENDATIONS.map(rec => (
          <View key={rec.id} style={styles.recCard}>
            <View style={styles.recImagePlaceholder} />
            <Text style={[styles.recTitle, inter18('bold')]} numberOfLines={2}>
              {rec.title}
            </Text>
            <Text style={[styles.recDesc, inter18('regular')]} numberOfLines={2}>
              {rec.description}
            </Text>
            <Pressable style={styles.recPriceBtn}>
              <Text style={[styles.recPriceBtnText, inter18('bold')]}>₹{rec.price}</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ServiceCartScreen({
  onBack,
  onOpenNotifications,
  onProceedToCheckout,
}: Props) {
  const { items, total: apiTotal, loading, error, userId, reload } = useServiceCart();
  const { profile } = useUserProfile();
  const {
    addresses,
    selectedAddress,
    loading: addressesLoading,
    saving: addressSaving,
    selectAddress,
    saveAddress,
    removeAddress,
  } = useServiceAddresses();
  const [addressPickerVisible, setAddressPickerVisible] = useState(false);
  const [addressPickerAddMode, setAddressPickerAddMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [useRewardCoins, setUseRewardCoins] = useState(true);
  const [removingCartItemId, setRemovingCartItemId] = useState<number | null>(null);
  const [buyingNowItemId, setBuyingNowItemId] = useState<string | null>(null);
  const [isProceeding, setIsProceeding] = useState(false);

  useEffect(() => {
    setSelectedIds(new Set(items.map(i => i.id)));
  }, [items]);

  const selectedItems = items.filter(i => selectedIds.has(i.id));
  const allSelected = selectedItems.length === items.length && items.length > 0;

  const itemTotal = useMemo(
    () => selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [selectedItems],
  );

  const bagDiscount = selectedItems.length > 0 ? Math.round(itemTotal * 0.12) : 0;
  const rewardDiscount = useRewardCoins && selectedItems.length > 0 ? 500 : 0;
  const computedOrderTotal = Math.max(0, itemTotal - bagDiscount - rewardDiscount);
  const orderTotal = useMemo(() => {
    if (selectedItems.length === 0) {
      return 0;
    }
    if (selectedItems.length === items.length && apiTotal > 0) {
      return apiTotal;
    }
    return computedOrderTotal;
  }, [selectedItems.length, items.length, apiTotal, computedOrderTotal]);

  const toggleItem = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  const handleProceedToBuy = async () => {
    if (selectedItems.length === 0) {
      return;
    }
    if (!selectedAddress) {
      setAddressPickerAddMode(true);
      setAddressPickerVisible(true);
      Alert.alert('Delivery address', 'Please add a delivery address to continue.');
      return;
    }
    if (userId == null) {
      Alert.alert('Checkout', 'CRM user id is not available. Please log in again.');
      return;
    }
    if (!onProceedToCheckout) {
      return;
    }

    setIsProceeding(true);
    try {
      const fullCartPreview = await fetchCartCheckoutPreview(userId);
      const preview = filterCheckoutPreviewForSelection(
        fullCartPreview,
        selectedItems.map(item => item.cartItemId),
      );
      if (getCheckoutPreviewItems(preview).length === 0) {
        Alert.alert('Checkout', 'Select at least one item to proceed.');
        return;
      }
      onProceedToCheckout(preview);
    } catch (err) {
      Alert.alert('Checkout', getServiceCartErrorMessage(err));
    } finally {
      setIsProceeding(false);
    }
  };

  const handleBuyNow = async (item: ServiceCartLineItem) => {
    if (userId == null) {
      Alert.alert('Checkout', 'CRM user id is not available. Please log in again.');
      return;
    }
    if (!onProceedToCheckout) {
      return;
    }

    setBuyingNowItemId(item.id);
    try {
      const preview = await fetchBuyNowCheckoutPreview(
        userId,
        item.serviceId,
        item.variantId,
      );
      const buyNowLines = getCheckoutPreviewItems(preview);
      if (buyNowLines.length === 0) {
        Alert.alert('Checkout', 'Could not load buy now preview for this service.');
        return;
      }
      if (__DEV__ && buyNowLines.length > 1) {
        // eslint-disable-next-line no-console
        console.warn(
          '[ServiceCart] Buy now expected 1 line, got',
          buyNowLines.length,
          '— filtered by service/variant',
        );
      }
      // Open checkout for this single item; payment uses POST …/service/buy-now on Proceed to Buy.
      onProceedToCheckout(preview);
    } catch (err) {
      Alert.alert('Buy now', getServiceCartErrorMessage(err));
    } finally {
      setBuyingNowItemId(null);
    }
  };

  const handleRemoveItem = async (item: ServiceCartLineItem) => {
    if (userId == null) {
      Alert.alert('Could not remove', 'CRM user id is not available. Please log in again.');
      return;
    }

    setRemovingCartItemId(item.cartItemId);
    try {
      await removeServiceCartItem(item.cartItemId, userId);
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      await reload({ silent: true });
    } catch (err) {
      Alert.alert('Could not remove', getServiceCartErrorMessage(err));
    } finally {
      setRemovingCartItemId(null);
    }
  };

  const totalSavings =
    selectedItems.reduce(
      (s, i) => s + Math.max(0, i.originalPrice - i.price) * i.quantity,
      0,
    ) +
    bagDiscount +
    rewardDiscount;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppScreenHeader
          variant="title"
          title="Cart"
          onBack={onBack}
          onNotificationPress={onOpenNotifications}
          notificationCount={1}
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#5B21B6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppScreenHeader
        variant="title"
        title="Cart"
        onBack={onBack}
        onNotificationPress={onOpenNotifications}
        notificationCount={1}
      />

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={[styles.errorBannerText, inter18('regular')]}>{error}</Text>
          <Pressable onPress={() => reload()} style={styles.retryBtn}>
            <Text style={[styles.retryBtnText, inter18('bold')]}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {items.length > 0 ? (
          <Pressable onPress={toggleAll}>
            <Text style={[styles.deselectLink, inter18('medium')]}>
              {allSelected ? 'Deselect all items' : 'Select all items'}
            </Text>
          </Pressable>
        ) : null}

        {items.length === 0 && !error ? (
          <View style={styles.emptyCart}>
            <Text style={[styles.emptyCartTitle, inter18('bold')]}>Your cart is empty</Text>
            <Text style={[styles.emptyCartSub, inter18('regular')]}>
              Browse services and tap the price button to add items here.
            </Text>
            <Pressable onPress={onBack} style={styles.emptyCartBtn}>
              <Text style={[styles.emptyCartBtnText, inter18('bold')]}>Continue shopping</Text>
            </Pressable>
          </View>
        ) : null}

        {items.map(item => (
          <CartItemCard
            key={item.id}
            item={item}
            selected={selectedIds.has(item.id)}
            onToggle={() => toggleItem(item.id)}
            onRemove={() => handleRemoveItem(item)}
            onBuyNow={() => handleBuyNow(item)}
            isRemoving={removingCartItemId === item.cartItemId}
            isBuyingNow={buyingNowItemId === item.id}
          />
        ))}

        {items.length > 0 ? (
          <>
        {/* Coupons */}
        <Text style={[styles.sectionTitle, inter18('bold')]}>Coupons and Offers</Text>
        <View style={styles.couponCard}>
          <View style={styles.couponTop}>
            <TagIcon />
            <Text style={[styles.couponCode, inter18('bold')]}>{STATIC_COUPON.code}</Text>
            <Pressable style={styles.couponApplyBtn}>
              <Text style={[styles.couponApplyText, inter18('bold')]}>APPLY</Text>
            </Pressable>
          </View>
          <View style={styles.couponHintBox}>
            <Text style={[styles.couponHint, inter18('regular')]}>{STATIC_COUPON.hint}</Text>
          </View>
        </View>
        <Pressable style={styles.viewAllRow}>
          <Text style={[styles.viewAllText, inter18('medium')]}>View All</Text>
          <Text style={styles.viewAllChevron}>›</Text>
        </Pressable>

        {/* Bill */}
        <Text style={[styles.sectionTitle, inter18('bold')]}>Bill Details</Text>
        <View style={styles.billCard}>
          <View style={styles.rewardRow}>
            <CoinIcon />
            <Text style={[styles.rewardLabel, inter18('medium')]}>Use reward coins</Text>
            <Text style={[styles.rewardValue, inter18('bold')]}>500</Text>
            <Switch
              value={useRewardCoins}
              onValueChange={setUseRewardCoins}
              trackColor={{ false: '#E5E7EB', true: '#86EFAC' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <BillRow label="Item Total" value={`₹${itemTotal.toLocaleString('en-IN')}`} />
          {bagDiscount > 0 ? (
            <BillRow
              label="Bag Discount"
              value={`-₹${bagDiscount.toLocaleString('en-IN')}`}
              highlight
            />
          ) : null}
          <BillRow label="Delivery Fee" value="FREE" highlight />
          {rewardDiscount > 0 ? (
            <BillRow
              label="Reward Discount"
              value={`-₹${rewardDiscount.toLocaleString('en-IN')}`}
              highlight
            />
          ) : null}
          <BillRow label="Handling Fee" value="₹0" />

          <View style={styles.orderTotalRow}>
            <Text style={[styles.orderTotalLabel, inter18('bold')]}>Order Total</Text>
            <Text style={[styles.orderTotalValue, inter18('bold')]}>
              ₹{orderTotal.toLocaleString('en-IN')}
            </Text>
          </View>

          {totalSavings > 0 ? (
            <View style={styles.savingsBanner}>
              <Text style={[styles.savingsBannerText, inter18('bold')]}>
                ⭐ YOU SAVE ₹{totalSavings.toLocaleString('en-IN')} ON THIS ORDER ⭐
              </Text>
            </View>
          ) : null}
        </View>

        <RecommendationCarousel title="You may also need" />
        <TopPicksCarousel title="Top picks for you" />

        <View style={styles.bundleCard}>
          <Text style={[styles.bundleTitle, inter18('bold')]}>Newly Married Pack</Text>
          <Text style={[styles.bundleDesc, inter18('regular')]}>
            Marriage Certificate + Aadhaar Name update + PAN Card Update
          </Text>
        </View>
          </>
        ) : null}

        <View style={styles.scrollBottomSpacer} />
      </ScrollView>

      {/* Sticky footer */}
      {items.length > 0 ? (
      <View style={styles.footer}>
        <ServiceDeliveryAddressBar
          address={selectedAddress}
          loading={addressesLoading}
          onChangePress={() => {
            setAddressPickerAddMode(!selectedAddress);
            setAddressPickerVisible(true);
          }}
        />

        <View style={styles.freeDeliveryBar}>
          <CheckGreenIcon />
          <Text style={[styles.freeDeliveryText, inter18('medium')]}>Yay! You get FREE Delivery</Text>
        </View>

        <View style={styles.checkoutRow}>
          <View>
            <Text style={[styles.checkoutTotal, inter18('bold')]}>₹{orderTotal.toLocaleString('en-IN')}</Text>
            <Text style={[styles.checkoutMeta, inter18('regular')]}>
              {selectedItems.length} item{selectedItems.length === 1 ? '' : 's'} selected
            </Text>
          </View>
          <Pressable
            style={[
              styles.proceedBtn,
              (selectedItems.length === 0 || isProceeding) && styles.proceedBtnDisabled,
            ]}
            onPress={handleProceedToBuy}
            disabled={selectedItems.length === 0 || isProceeding}>
            {isProceeding ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={[styles.proceedBtnText, inter18('bold')]}>Proceed To Buy</Text>
                <ArrowRightIcon />
              </>
            )}
          </Pressable>
        </View>
      </View>
      ) : null}

      <ServiceAddressPickerModal
        visible={addressPickerVisible}
        addresses={addresses}
        selectedAddressId={selectedAddress?.id ?? null}
        loading={addressesLoading}
        saving={addressSaving}
        profileName={profile?.name}
        profilePhone={profile?.contactNumber}
        startInAddMode={addressPickerAddMode}
        onClose={() => setAddressPickerVisible(false)}
        onSelectAddress={addressId => {
          void selectAddress(addressId);
        }}
        onSaveAddress={async (input, addressId) => {
          await saveAddress(input, addressId);
        }}
        onDeleteAddress={removeAddress}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const PURPLE = '#5B21B6';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
  },

  errorBannerText: {
    fontSize: 12,
    color: '#B91C1C',
    lineHeight: 18,
  },

  retryBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#5B21B6',
  },

  retryBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
  },

  emptyCart: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },

  emptyCartTitle: {
    fontSize: 17,
    color: '#111827',
    marginBottom: 8,
  },

  emptyCartSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  emptyCartBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#5B21B6',
  },

  emptyCartBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },

  scrollBottomSpacer: {
    height: 24,
  },

  deselectLink: {
    fontSize: 13,
    color: '#2563EB',
    marginBottom: 12,
  },

  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
    overflow: 'hidden',
  },

  itemPromoRibbon: {
    backgroundColor: '#FCE7F3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
  },

  itemPromoText: {
    fontSize: 11,
    color: '#9D174D',
  },

  itemBody: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    alignItems: 'flex-start',
  },

  itemImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  itemContent: {
    flex: 1,
    gap: 4,
  },

  itemTitle: {
    fontSize: 14,
    color: '#111827',
  },

  itemDesc: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },

  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },

  itemPrice: {
    fontSize: 15,
    color: '#16A34A',
  },

  itemOriginalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },

  saveTag: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  saveTagText: {
    fontSize: 10,
    color: '#C2410C',
  },

  itemActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  itemActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },

  itemActionDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },

  itemActionText: {
    fontSize: 12,
    color: '#374151',
  },

  itemActionBtnDisabled: {
    opacity: 0.6,
  },

  sectionTitle: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 10,
    marginTop: 4,
  },

  couponCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#A78BFA',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },

  couponTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },

  couponCode: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    letterSpacing: 0.5,
  },

  couponApplyBtn: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },

  couponApplyText: {
    fontSize: 12,
    color: '#16A34A',
  },

  couponHintBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    padding: 10,
  },

  couponHint: {
    fontSize: 12,
    color: '#6D28D9',
  },

  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 16,
  },

  viewAllText: {
    fontSize: 13,
    color: '#2563EB',
  },

  viewAllChevron: {
    fontSize: 18,
    color: '#2563EB',
    lineHeight: 20,
  },

  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 20,
  },

  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  rewardLabel: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },

  rewardValue: {
    fontSize: 13,
    color: '#111827',
    marginRight: 4,
  },

  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  billLabel: {
    fontSize: 13,
    color: '#6B7280',
  },

  billValue: {
    fontSize: 13,
    color: '#111827',
  },

  billValueGreen: {
    color: '#16A34A',
  },

  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  orderTotalLabel: {
    fontSize: 15,
    color: '#111827',
  },

  orderTotalValue: {
    fontSize: 20,
    color: '#111827',
  },

  savingsBanner: {
    marginTop: 12,
    backgroundColor: PURPLE,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },

  savingsBannerText: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  recSection: {
    marginBottom: 18,
  },

  recScroll: {
    gap: 12,
    paddingRight: 8,
  },

  recCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
  },

  recImagePlaceholder: {
    height: 72,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },

  recTitle: {
    fontSize: 12,
    color: '#111827',
    marginBottom: 4,
    minHeight: 32,
  },

  recDesc: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 8,
    minHeight: 28,
  },

  recPriceBtn: {
    backgroundColor: PURPLE,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },

  recPriceBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
  },

  bundleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 8,
  },

  bundleTitle: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 6,
  },

  bundleDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },

  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 8,
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  addressText: {
    flex: 1,
  },

  addressName: {
    fontSize: 13,
    color: '#111827',
    marginBottom: 2,
  },

  addressLine: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },

  changeLink: {
    fontSize: 13,
    color: '#2563EB',
  },

  freeDeliveryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
  },

  freeDeliveryText: {
    fontSize: 12,
    color: '#047857',
  },

  checkoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 12,
  },

  checkoutTotal: {
    fontSize: 18,
    color: '#111827',
  },

  checkoutMeta: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },

  proceedBtn: {
    flex: 1,
    maxWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  proceedBtnDisabled: {
    opacity: 0.5,
  },

  proceedBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
  },

  coinIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  coinIconStar: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 14,
  },
});

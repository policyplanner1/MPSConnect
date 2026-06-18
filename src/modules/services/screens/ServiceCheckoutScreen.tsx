import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import AppScreenHeader from '../../../components/AppScreenHeader';
import { inter18 } from '../../../core/theme/typography';
import {
  collectCheckoutDocuments,
  getCheckoutItemKey,
  getCheckoutPreviewItems,
  mapApiCartItemToLineItem,
} from '../api/serviceCartApi';
import TopPicksCarousel from '../components/TopPicksCarousel';
import { useCheckoutPayment } from '../hooks/useCheckoutPayment';
import { mapRelatedToTopPicks, useRelatedServices } from '../hooks/useRelatedServices';
import { CartApiIndividualItem, CheckoutPreviewData, CheckoutSummary } from '../types/cart.types';
import { ServiceDocument } from '../types/service.types';
import type { TopPickCardItem } from '../hooks/useServiceHomePopular';

type Props = {
  preview: CheckoutPreviewData;
  onBack: () => void;
  onOpenNotifications?: () => void;
  onProceedToUpload?: (params: {
    documents: ServiceDocument[];
    orderId: string;
    parentOrderId: string;
  }) => void;
};

// ─── Icons ───────────────────────────────────────────────────────────────────

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

function HomeIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9.5z"
        stroke="#2563EB"
        strokeWidth="1.8"
        fill="none"
      />
    </Svg>
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

function DocumentUploadIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        stroke="#6B7280"
        strokeWidth="1.6"
        fill="none"
      />
      <Path
        d="M14 2v6h6M12 18v-6M9 15l3-3 3 3"
        stroke="#6B7280"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function ChevronDownIcon({ flipped }: { flipped?: boolean }) {
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      style={flipped ? { transform: [{ rotate: '180deg' }] } : undefined}>
      <Path
        d="M6 9L12 15L18 9"
        stroke="#6B7280"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// ─── Static UI (wire to API later) ─────────────────────────────────────────────

const STATIC_ADDRESS = {
  name: 'Samiksha Shetty',
  line: '6-60, GF CT MALL, Pant Nagar, Worli, Mumbai - 400018',
};

const STATIC_COUPON = {
  code: 'REWARD20',
  hint: 'Add ₹240 more to avail this offer. Get Flat ₹20 off',
};

const STATIC_RECOMMENDATIONS = [
  { id: 'r1', title: 'Marriage Certificate', price: 3700, description: 'Official registration support' },
  { id: 'r2', title: 'PAN Card Update', price: 899, description: 'Name change after marriage' },
  { id: 'r3', title: 'Aadhaar Name Update', price: 499, description: 'Quick document assistance' },
];

const STATIC_BUNDLES = [
  {
    id: 'b1',
    title: 'Newly Married Pack',
    services: 'Marriage Certificate + Aadhaar Name update + PAN Card Update',
    price: 4999,
  },
  {
    id: 'b2',
    title: 'New Home Set Up Pack',
    services: 'Rent Agreement + Electricity Transfer + Society NOC',
    price: 6499,
  },
];

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SelectedItemCard({ item }: { item: CartApiIndividualItem }) {
  const line = mapApiCartItemToLineItem(item);
  const estimatedOriginal = Math.round(item.price * 1.25);
  const savings = Math.max(0, estimatedOriginal - item.price);
  const pctOff = savings > 0 ? Math.round((savings / estimatedOriginal) * 100) : 0;

  return (
    <View style={styles.selectedCard}>
      <View style={styles.selectedIconWrap}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.selectedImage}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.selectedIconEmoji}>🏠</Text>
        )}
      </View>
      <View style={styles.selectedContent}>
        <Text style={[styles.selectedTitle, inter18('bold')]} numberOfLines={2}>
          {item.title || line.title}
        </Text>
        <Text style={[styles.selectedDesc, inter18('regular')]} numberOfLines={3}>
          {item.service_name}
          {item.variant_name ? ` · ${item.variant_name}` : ''}
        </Text>
        <View style={styles.selectedPriceRow}>
          <Text style={[styles.selectedPrice, inter18('bold')]}>{formatInr(item.price)}</Text>
          {pctOff > 0 ? (
            <>
              <Text style={[styles.selectedOriginal, inter18('regular')]}>
                {formatInr(estimatedOriginal)}
              </Text>
              <Text style={[styles.selectedOffTag, inter18('medium')]}>({pctOff}% OFF)</Text>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function DocumentsSection({ documents }: { documents: ServiceDocument[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  if (!documents.length) {
    return null;
  }

  return (
    <View style={styles.documentsSection}>
      <View style={styles.documentsHeader}>
        <Text style={[styles.sectionTitleBlue, inter18('bold')]}>Documents Needed to Proceed</Text>
        <Text style={styles.documentsFolderEmoji}>📂</Text>
      </View>

      {documents.map(doc => {
        const expanded = openId === doc.id;
        return (
          <Pressable
            key={doc.id}
            style={styles.documentRow}
            onPress={() => setOpenId(expanded ? null : doc.id)}>
            <DocumentUploadIcon />
            <View style={styles.documentText}>
              <Text style={[styles.documentTitle, inter18('semiBold')]}>{doc.document_name}</Text>
              <Text style={[styles.documentSub, inter18('regular')]} numberOfLines={1}>
                {doc.is_mandatory === 1 ? 'Mandatory document' : 'Optional document'}
              </Text>
              {expanded ? (
                <Text style={[styles.documentHint, inter18('regular')]}>
                  Upload a clear copy when prompted during checkout.
                </Text>
              ) : null}
            </View>
            <ChevronDownIcon flipped={expanded} />
          </Pressable>
        );
      })}
    </View>
  );
}

function BillRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
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

function BillDetails({
  summary,
  useRewardCoins,
  onToggleReward,
}: {
  summary: CheckoutSummary;
  useRewardCoins: boolean;
  onToggleReward: (v: boolean) => void;
}) {
  const deliveryLabel =
    summary.delivery_fee === 0 ? 'FREE' : `+${formatInr(summary.delivery_fee)}`;
  const totalSavings = summary.discount + summary.reward_discount;

  return (
    <View style={styles.billCard}>
      <Text style={[styles.sectionTitle, inter18('bold')]}>Bill Details</Text>
      <View style={styles.rewardRow}>
        <CoinIcon />
        <Text style={[styles.rewardLabel, inter18('medium')]}>Use Reward Coins</Text>
        <Text style={[styles.rewardValue, inter18('bold')]}>500</Text>
        <Switch
          value={useRewardCoins}
          onValueChange={onToggleReward}
          trackColor={{ false: '#E5E7EB', true: '#86EFAC' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <BillRow label="Item Total" value={formatInr(summary.item_total)} />
      {summary.discount > 0 ? (
        <BillRow label="Bag Discount" value={`-${formatInr(summary.discount)}`} highlight />
      ) : null}
      <BillRow label="Delivery Fee" value={deliveryLabel} highlight={summary.delivery_fee === 0} />
      {summary.reward_discount > 0 ? (
        <BillRow
          label="Reward Discount"
          value={`-${formatInr(summary.reward_discount)}`}
          highlight
        />
      ) : null}
      <BillRow label="Handling Fee" value={formatInr(summary.handling_fee)} />

      <View style={styles.orderTotalRow}>
        <Text style={[styles.orderTotalLabel, inter18('bold')]}>Order Total</Text>
        <Text style={[styles.orderTotalValue, inter18('bold')]}>{formatInr(summary.total)}</Text>
      </View>

      {totalSavings > 0 ? (
        <View style={styles.savingsBanner}>
          <Text style={[styles.savingsBannerText, inter18('bold')]}>
            ⭐ YOU SAVE {formatInr(totalSavings)} ON THIS ORDER ⭐
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function RecommendationCard({ rec }: { rec: TopPickCardItem }) {
  return (
    <View style={styles.recCard}>
      {rec.imageUri ? (
        <Image source={{ uri: rec.imageUri }} style={styles.recImage} resizeMode="contain" />
      ) : (
        <View style={styles.recImagePlaceholder} />
      )}
      <Text style={[styles.recTitle, inter18('bold')]} numberOfLines={2}>
        {rec.title}
      </Text>
      <Text style={[styles.recDesc, inter18('regular')]} numberOfLines={2}>
        {rec.description}
      </Text>
      <Pressable style={styles.recPriceBtn}>
        <Text style={[styles.recPriceBtnText, inter18('bold')]}>₹{rec.price.toLocaleString('en-IN')}</Text>
      </Pressable>
    </View>
  );
}

function RecommendationCarousel({
  title,
  items,
}: {
  title: string;
  items: TopPickCardItem[];
}) {
  if (!items.length) {
    return null;
  }

  return (
    <View style={styles.recSection}>
      <Text style={[styles.sectionTitle, inter18('bold')]}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recScroll}>
        {items.map(rec => (
          <RecommendationCard key={`${title}-${rec.id}`} rec={rec} />
        ))}
      </ScrollView>
    </View>
  );
}

function RelatedServicesSection({
  serviceId,
}: {
  serviceId: number;
}) {
  const { items, loading, error } = useRelatedServices(serviceId);
  const carouselItems = useMemo(() => mapRelatedToTopPicks(items), [items]);

  if (loading) {
    return (
      <View style={styles.recSection}>
        <Text style={[styles.sectionTitle, inter18('bold')]}>You may also need</Text>
        <View style={styles.recLoadingRow}>
          <ActivityIndicator size="small" color="#6D28D9" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.recSection}>
        <Text style={[styles.sectionTitle, inter18('bold')]}>You may also need</Text>
        <Text style={[styles.recErrorText, inter18('regular')]}>{error}</Text>
      </View>
    );
  }

  return <RecommendationCarousel title="You may also need" items={carouselItems} />;
}

function LimitedOfferBanner() {
  return (
    <View style={styles.limitedBanner}>
      <Text style={styles.limitedEmoji}>⏰</Text>
      <View style={styles.limitedTextWrap}>
        <Text style={[styles.limitedTitle, inter18('bold')]}>LIMITED TIME OFFER</Text>
        <Text style={[styles.limitedSub, inter18('regular')]}>Exclusive deals on selected services</Text>
      </View>
      <Pressable style={styles.limitedBtn}>
        <Text style={[styles.limitedBtnText, inter18('bold')]}>Buy now</Text>
      </Pressable>
    </View>
  );
}

function BundleServicesSection() {
  return (
    <View style={styles.bundleSection}>
      <Text style={[styles.sectionTitle, inter18('bold')]}>Bundle Services</Text>
      {STATIC_BUNDLES.map(bundle => (
        <View key={bundle.id} style={styles.bundleCard}>
          <Text style={[styles.bundleTitle, inter18('bold')]}>{bundle.title}</Text>
          <Text style={[styles.bundleDesc, inter18('regular')]}>{bundle.services}</Text>
          <Pressable style={styles.bundleBtn}>
            <Text style={[styles.bundleBtnText, inter18('bold')]}>
              Get this Package at {formatInr(bundle.price)}
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ServiceCheckoutScreen({
  preview,
  onBack,
  onOpenNotifications,
  onProceedToUpload,
}: Props) {
  const [useRewardCoins, setUseRewardCoins] = useState(preview.summary.reward_discount > 0);
  const { payAndProceed, paying, statusLabel } = useCheckoutPayment();

  const checkoutItems = useMemo(() => getCheckoutPreviewItems(preview), [preview]);
  const documents = useMemo(() => collectCheckoutDocuments(checkoutItems), [checkoutItems]);
  const itemCount = checkoutItems.length;
  const isBuyNow = preview.type === 'buy_now';
  const buyNowServiceId =
    isBuyNow && checkoutItems[0] ? checkoutItems[0].service_id : null;

  const handleProceedToBuy = useCallback(async () => {
    if (!onProceedToUpload) {
      return;
    }

    const payment = await payAndProceed({
      preview,
      itemCount,
      orderLabel: isBuyNow ? 'Buy now' : 'Service order',
    });

    if (!payment) {
      return;
    }

    const orderId = payment.orderRefs[0]
      ? payment.orderRefs[0].startsWith('#')
        ? payment.orderRefs[0]
        : `#${payment.orderRefs[0]}`
      : `#${payment.orderDisplayId}`;

    onProceedToUpload({
      documents,
      orderId,
      parentOrderId: payment.parentOrderId,
    });
  }, [
    documents,
    isBuyNow,
    itemCount,
    onProceedToUpload,
    payAndProceed,
    preview,
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppScreenHeader
        variant="title"
        title="Checkout"
        onBack={onBack}
        onNotificationPress={onOpenNotifications}
        notificationCount={4}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Selected items */}
        <Text style={[styles.sectionTitleBlue, inter18('bold')]}>
          {isBuyNow ? 'Buy Now' : 'Selected Items'}
        </Text>
        {checkoutItems.map(item => (
          <SelectedItemCard key={getCheckoutItemKey(item)} item={item} />
        ))}

        <DocumentsSection documents={documents} />

        {/* Coupons */}
        <Text style={[styles.couponsHeading, inter18('bold')]}>coupons and offers</Text>
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
          <Text style={[styles.viewAllText, inter18('medium')]}>VIEW ALL</Text>
          <Text style={styles.viewAllChevron}>›</Text>
        </Pressable>

        <BillDetails
          summary={preview.summary}
          useRewardCoins={useRewardCoins}
          onToggleReward={setUseRewardCoins}
        />

        {isBuyNow && buyNowServiceId != null ? (
          <RelatedServicesSection serviceId={buyNowServiceId} />
        ) : (
          <RecommendationCarousel
            title="You may also need"
            items={STATIC_RECOMMENDATIONS.map(rec => ({
              id: rec.id,
              title: rec.title,
              description: rec.description,
              price: rec.price,
              imageUri: null,
            }))}
          />
        )}
        {!isBuyNow ? <LimitedOfferBanner /> : null}
        <TopPicksCarousel title="Top Pick for you" />
        <RecommendationCarousel
          title="Value added services"
          items={STATIC_RECOMMENDATIONS.map(rec => ({
            id: `va-${rec.id}`,
            title: rec.title,
            description: rec.description,
            price: rec.price,
            imageUri: null,
          }))}
        />
        <BundleServicesSection />

        <View style={styles.scrollBottomSpacer} />
      </ScrollView>

      {/* Sticky footer */}
      <View style={styles.footer}>
        <View style={styles.addressRow}>
          <HomeIcon />
          <View style={styles.addressText}>
            <Text style={[styles.addressName, inter18('bold')]}>
              Delivering to {STATIC_ADDRESS.name}
            </Text>
            <Text style={[styles.addressLine, inter18('regular')]} numberOfLines={2}>
              {STATIC_ADDRESS.line}
            </Text>
          </View>
          <Pressable>
            <Text style={[styles.changeLink, inter18('bold')]}>Change</Text>
          </Pressable>
        </View>

        <View style={styles.freeDeliveryBar}>
          <CheckGreenIcon />
          <Text style={[styles.freeDeliveryText, inter18('medium')]}>Yay! You got free delivery</Text>
        </View>

        <View style={styles.checkoutRow}>
          <View>
            <Text style={[styles.checkoutTotal, inter18('bold')]}>
              {formatInr(preview.summary.total)}
            </Text>
            <Text style={[styles.checkoutMeta, inter18('regular')]}>
              {itemCount} item{itemCount === 1 ? '' : 's'}
              {isBuyNow ? '' : ' selected'}
            </Text>
          </View>
          <Pressable
            style={[styles.proceedBtn, paying && styles.proceedBtnDisabled]}
            onPress={handleProceedToBuy}
            disabled={paying}>
            {paying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={[styles.proceedBtnText, inter18('bold')]}>Proceed to Buy</Text>
                <ArrowRightIcon />
              </>
            )}
          </Pressable>
        </View>
      </View>

      <Modal visible={paying} transparent animationType="fade">
        <View style={styles.paymentOverlay}>
          <View style={styles.paymentOverlayCard}>
            <ActivityIndicator size="large" color={PURPLE} />
            <Text style={[styles.paymentOverlayText, inter18('medium')]}>{statusLabel}</Text>
          </View>
        </View>
      </Modal>
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

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },

  scrollBottomSpacer: {
    height: 16,
  },

  sectionTitle: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 10,
    marginTop: 4,
  },

  sectionTitleBlue: {
    fontSize: 16,
    color: '#2563EB',
    marginBottom: 10,
  },

  selectedCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },

  selectedIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  selectedImage: {
    width: 64,
    height: 64,
  },

  selectedIconEmoji: {
    fontSize: 36,
  },

  selectedContent: {
    flex: 1,
    gap: 6,
  },

  selectedTitle: {
    fontSize: 15,
    color: '#111827',
  },

  selectedDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },

  selectedPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },

  selectedPrice: {
    fontSize: 16,
    color: '#16A34A',
  },

  selectedOriginal: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },

  selectedOffTag: {
    fontSize: 12,
    color: '#DC2626',
  },

  documentsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 16,
  },

  documentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  documentsFolderEmoji: {
    fontSize: 28,
  },

  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  documentText: {
    flex: 1,
    gap: 2,
  },

  documentTitle: {
    fontSize: 13,
    color: '#111827',
  },

  documentSub: {
    fontSize: 11,
    color: '#6B7280',
  },

  documentHint: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 4,
    lineHeight: 16,
  },

  couponsHeading: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 10,
    textTransform: 'lowercase',
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
    backgroundColor: '#EDE9FF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },

  savingsBannerText: {
    fontSize: 11,
    color: '#5B21B6',
    textAlign: 'center',
  },

  recSection: {
    marginBottom: 18,
  },

  recLoadingRow: {
    paddingVertical: 24,
    alignItems: 'center',
  },

  recErrorText: {
    fontSize: 13,
    color: '#6B7280',
    paddingVertical: 8,
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

  recImage: {
    height: 72,
    width: '100%',
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

  limitedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    gap: 10,
  },

  limitedEmoji: {
    fontSize: 32,
  },

  limitedTextWrap: {
    flex: 1,
  },

  limitedTitle: {
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 2,
  },

  limitedSub: {
    fontSize: 11,
    color: '#DBEAFE',
  },

  limitedBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  limitedBtnText: {
    fontSize: 12,
    color: '#2563EB',
  },

  bundleSection: {
    marginBottom: 8,
  },

  bundleCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    padding: 14,
    marginBottom: 12,
  },

  bundleTitle: {
    fontSize: 15,
    color: '#5B21B6',
    marginBottom: 6,
  },

  bundleDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
  },

  bundleBtn: {
    backgroundColor: PURPLE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  bundleBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
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
    color: PURPLE,
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
    opacity: 0.75,
  },

  paymentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  paymentOverlayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: 'center',
    minWidth: 260,
    gap: 14,
  },

  paymentOverlayText: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
  },

  proceedBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});

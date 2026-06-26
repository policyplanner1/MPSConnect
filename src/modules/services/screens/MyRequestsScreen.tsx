import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { inter18 } from '../../../core/theme/typography';
import { ServiceHomePromoBlock } from '../../explore';
import type { ServiceHomeBannerItem, ServiceHomeServiceItem } from '../../explore';
import HomeHeroHeader from '../components/HomeHeroHeader';
import ServicesSectionCard from '../components/ServicesSectionCard';
import { useMyOrders } from '../hooks/useMyOrders';
import type { MyOrdersParentOrder } from '../types/myOrders.types';
import { isCancelledStatus, resolveOrderDisplayStatus, shouldShowInMyRequests } from '../utils/orderStatus';
import OrderDetailsScreen from './OrderDetailsScreen';
import UploadDocuments from './UploadDocuments';

function formatDateTime(raw: string): string {
  // API format: "YYYY-MM-DD HH:mm:ss"
  const iso = raw.includes(' ') ? raw.replace(' ', 'T') : raw;
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) {
    return raw;
  }
  return dt.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

function statusMeta(status: string): { label: string; bg: string; fg: string } {
  const s = String(status || '').toLowerCase();
  if (s.includes('paid') || s === 'completed' || s === 'success') {
    return { label: status, bg: '#DCFCE7', fg: '#166534' };
  }
  if (isCancelledStatus(s) || s.includes('fail') || s.includes('reject')) {
    return { label: status, bg: '#FEE2E2', fg: '#991B1B' };
  }
  if (s.includes('pending')) {
    return { label: status.replace(/_/g, ' '), bg: '#FEF3C7', fg: '#92400E' };
  }
  return { label: status.replace(/_/g, ' '), bg: '#E5E7EB', fg: '#374151' };
}

function OrderCard({
  order,
  onViewDetails,
}: {
  order: MyOrdersParentOrder;
  onViewDetails?: (parentOrderId: string) => void;
}) {
  const displayStatus = resolveOrderDisplayStatus(order);
  const badge = statusMeta(displayStatus);

  const subtitle = useMemo(() => {
    const counts = [];
    if (order.summary?.total_items) {
      counts.push(`${order.summary.total_items} item${order.summary.total_items > 1 ? 's' : ''}`);
    }
    if (order.summary?.total_bundles) {
      counts.push(
        `${order.summary.total_bundles} bundle${order.summary.total_bundles > 1 ? 's' : ''}`,
      );
    }
    return counts.length > 0 ? counts.join(' • ') : 'Order';
  }, [order.summary?.total_bundles, order.summary?.total_items]);

  const previewName =
    order.preview?.[0]?.name ?? order.items?.[0]?.service_name ?? 'Service request';

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.leftBlock}>
          <Text style={[styles.title, inter18('bold')]} numberOfLines={1}>
            {previewName}
          </Text>
          <Text style={[styles.subTitle, inter18('regular')]} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        <View style={styles.rightBlock}>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, inter18('semiBold'), { color: badge.fg }]}>
              {badge.label}
            </Text>
          </View>
          <Text style={[styles.amount, inter18('bold')]}>{formatMoney(order.total_amount)}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.metaLabel, inter18('regular')]}>Order ID</Text>
        <Text style={[styles.metaValue, inter18('medium')]} numberOfLines={1}>
          {order.parent_order_id}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.metaLabel, inter18('regular')]}>Created</Text>
        <Text style={[styles.metaValue, inter18('medium')]}>{formatDateTime(order.created_at)}</Text>
      </View>

      {order.items?.length ? (
        <View style={styles.itemsWrap}>
          {order.items.slice(0, 2).map(item => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.dot} />
              <View style={styles.itemTextWrap}>
                <Text style={[styles.itemName, inter18('semiBold')]} numberOfLines={1}>
                  {item.service_name}
                </Text>
                <Text style={[styles.itemVariant, inter18('regular')]} numberOfLines={1}>
                  {[item.variant_name, item.order_ref].filter(Boolean).join(' • ')}
                </Text>
              </View>
              <Text style={[styles.itemPrice, inter18('semiBold')]}>
                {formatMoney(item.price)}
              </Text>
            </View>
          ))}
          {order.items.length > 2 ? (
            <Text style={[styles.moreItems, inter18('regular')]}>
              +{order.items.length - 2} more
            </Text>
          ) : null}
        </View>
      ) : null}

      <Pressable
        onPress={() => onViewDetails?.(order.parent_order_id)}
        disabled={!onViewDetails}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}>
        <Text style={[styles.ctaText, inter18('semiBold')]}>View details</Text>
      </Pressable>
    </View>
  );
}

type MyRequestsScreenProps = {
  onOpenNotifications?: () => void;
  onOpenCart?: () => void;
  onOpenService?: (serviceId: number) => void;
  cartItemCount?: number;
  profileInitials?: string;
  userName?: string;
  onProfilePress?: () => void;
  initialParentOrderId?: string;
};

export default function MyRequestsScreen({
  onOpenNotifications,
  onOpenCart,
  onOpenService,
  cartItemCount,
  profileInitials = 'AJ',
  userName,
  onProfilePress,
  initialParentOrderId,
}: MyRequestsScreenProps) {
  const handleOpenService = (serviceId: number) => {
    onOpenService?.(serviceId);
  };

  const handleBannerPress = (banner: ServiceHomeBannerItem) => {
    if (banner.redirect_type === 'service' && banner.redirect_id > 0) {
      handleOpenService(banner.redirect_id);
    }
  };

  const handleServicePress = (item: ServiceHomeServiceItem) => {
    handleOpenService(item.service_id);
  };
  const { orders, loading, error, refetch } = useMyOrders();
  const visibleOrders = useMemo(
    () => orders.filter(shouldShowInMyRequests),
    [orders],
  );
  const [activeParentOrderId, setActiveParentOrderId] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<{
    parentOrderId: string;
    orderId: string;
  } | null>(null);

  useEffect(() => {
    if (initialParentOrderId) {
      setActiveParentOrderId(initialParentOrderId);
    }
  }, [initialParentOrderId]);

  const handleCloseOrderDetails = () => {
    setActiveParentOrderId(null);
    void refetch();
  };

  if (uploadState) {
    return (
      <UploadDocuments
        parentOrderId={uploadState.parentOrderId}
        orderId={uploadState.orderId}
        onBack={() => setUploadState(null)}
        onGoToOrders={() => {
          setUploadState(null);
          setActiveParentOrderId(null);
          void refetch();
        }}
      />
    );
  }

  if (activeParentOrderId) {
    return (
      <OrderDetailsScreen
        parentOrderId={activeParentOrderId}
        onBack={handleCloseOrderDetails}
        onViewAllOrders={handleCloseOrderDetails}
        onUploadDocuments={({ parentOrderId, orderId }) =>
          setUploadState({ parentOrderId, orderId })
        }
      />
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.heroWrap}>
        <HomeHeroHeader
          profileInitials={profileInitials}
          userName={userName}
          onProfilePress={onProfilePress}
          onNotificationPress={onOpenNotifications}
          onCartPress={onOpenCart}
          notificationCount={1}
          cartItemCount={cartItemCount}
          showHeroCopy={false}
          showHeroCurve={false}
          showChatIcon={false}
          heroBackgroundColor="#F7F7F7"
        />
      </View>

      <View style={styles.contentSheet}>
        {loading && visibleOrders.length === 0 && orders.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="small" color="#5E02AF" />
            <Text style={[styles.centerText, inter18('regular')]}>Loading…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={[styles.errorTitle, inter18('bold')]}>Couldn’t load</Text>
            <Text style={[styles.errorText, inter18('regular')]}>{error}</Text>
            <Pressable
              onPress={refetch}
              style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.9 }]}>
              <Text style={[styles.retryText, inter18('semiBold')]}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={visibleOrders}
            keyExtractor={item => item.parent_order_id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#5E02AF" />
            }
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <View style={styles.ordersSection}>
                  <Text style={[styles.ordersHeaderTitle, inter18('bold')]}>Your orders</Text>
                  <Text style={[styles.ordersSub, inter18('regular')]}>
                    Track and manage your service requests
                  </Text>
                </View>

                {visibleOrders.length === 0 && !loading ? (
                  <View style={styles.emptyWrap}>
                    <ServicesSectionCard title="Your orders">
                      <View style={styles.emptyInner}>
                        <Text style={[styles.emptyTitle, inter18('bold')]}>No requests yet</Text>
                        <Text style={[styles.emptyText, inter18('regular')]}>
                          Once you place an order, it will appear here.
                        </Text>
                      </View>
                    </ServicesSectionCard>
                  </View>
                ) : null}
              </View>
            }
            ListFooterComponent={
              <ServiceHomePromoBlock
                sectionKeys={['quick_services', 'popular_services', 'exclusive_offers']}
                onBannerPress={handleBannerPress}
                onServicePress={handleServicePress}
              />
            }
            renderItem={({ item }) => (
              <View style={styles.orderCardWrap}>
                <OrderCard order={item} onViewDetails={setActiveParentOrderId} />
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroWrap: {
    flexShrink: 0,
    backgroundColor: '#F7F7F7',
  },
  contentSheet: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#F7F7F7',
  },
  listHeader: {
    gap: 12,
    paddingTop: 4,
    paddingBottom: 8,
  },
  ordersSection: {
    paddingHorizontal: 16,
    gap: 4,
  },
  ordersHeaderTitle: {
    fontSize: 12,
    color: '#1E3A5F',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  ordersSub: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  listContent: {
    paddingBottom: 130,
    gap: 12,
  },
  orderCardWrap: {
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyWrap: {
    paddingHorizontal: 16,
  },
  emptyInner: {
    paddingHorizontal: 14,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  centerText: {
    fontSize: 12,
    color: '#6B7280',
  },
  errorTitle: {
    fontSize: 16,
    color: '#111827',
  },
  errorText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 4,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#111827',
  },
  emptyText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    padding: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 10,
  },
  leftBlock: {
    flex: 1,
    minWidth: 0,
  },
  rightBlock: {
    alignItems: 'flex-end',
    gap: 8,
  },
  title: {
    fontSize: 14,
    color: '#111827',
  },
  subTitle: {
    marginTop: 2,
    fontSize: 11,
    color: '#6B7280',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  amount: {
    fontSize: 14,
    color: '#111827',
  },
  metaRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  metaLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  metaValue: {
    flex: 1,
    fontSize: 11,
    color: '#111827',
    textAlign: 'right',
  },
  itemsWrap: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5E02AF',
  },
  itemTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 12,
    color: '#111827',
  },
  itemVariant: {
    marginTop: 1,
    fontSize: 11,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 12,
    color: '#111827',
  },
  moreItems: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 14,
  },
  cta: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#111111',
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
});


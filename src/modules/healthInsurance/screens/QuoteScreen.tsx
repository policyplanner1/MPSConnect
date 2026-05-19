import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { EnquiryFormData } from '../navigation/HealthInsuranceStack';
import { QuotePlan, getLogoUri, useHealthQuotes } from '../hooks/useHealthQuotes';

type SortKey = 'asc' | 'desc';

const COMPANY_COLORS = [
  '#FF6B35', '#0057A8', '#00A86B', '#7C3AED',
  '#E11D48', '#0891B2', '#D97706', '#059669',
];

type Props = {
  formData: EnquiryFormData;
  onBack: () => void;
};

/* ─── Helpers ───────────────────────────────────────────── */

function getColor(companyId: number): string {
  return COMPANY_COLORS[companyId % COMPANY_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatPremium(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}/yr`;
}

function formatCover(amount: number): string {
  if (amount >= 10000000) {
    const c = amount / 10000000;
    return `₹${c} Crore${c > 1 ? 's' : ''}`;
  }
  if (amount >= 100000) return `₹${amount / 100000} Lakh`;
  return `₹${(amount / 1000).toFixed(0)} Thousand`;
}

function memberSummary(formData: EnquiryFormData): string {
  const count =
    (formData.includeSelf ? 1 : 0) +
    (formData.includeSpouse ? 1 : 0) +
    formData.childrenCount;
  return `${count} member${count !== 1 ? 's' : ''}`;
}

/* ─── Icons ─────────────────────────────────────────────── */

function BackIcon() {
  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Path
        d="M15 18L9 12L15 6"
        fill="none"
        stroke="#1A5C35"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg height={14} viewBox="0 0 24 24" width={14}>
      <Path
        d="M20 6L9 17l-5-5"
        fill="none"
        stroke="#22C55E"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </Svg>
  );
}

/* ─── Loading progress bar ───────────────────────────────── */

function LoadingBar({ loaded, total }: { loaded: number; total: number }) {
  const pct = total > 0 ? loaded / total : 0;
  return (
    <View style={styles.loadingBarWrap}>
      <View style={styles.loadingBarTrack}>
        <View style={[styles.loadingBarFill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={styles.loadingBarText}>
        {total > 0 ? `Fetching plans… ${loaded} / ${total}` : 'Loading…'}
      </Text>
    </View>
  );
}

/* ─── Plan card ──────────────────────────────────────────── */

function PlanCard({ plan }: { plan: QuotePlan }) {
  const color = getColor(plan.company.company_id);
  const initials = getInitials(plan.company.company_name);
  const logoUri = getLogoUri(plan.company.logo);

  const includes = plan.features
    .map(f => f.includes)
    .filter((v): v is string => !!v)
    .slice(0, 3);

  return (
    <View style={styles.planCard}>
      {/* Top row */}
      <View style={styles.planTop}>
        <View style={[styles.planAvatar, { backgroundColor: color + '20' }]}>
          <Image
            source={{ uri: logoUri }}
            style={styles.planLogo}
            resizeMode="contain"
            onError={() => {/* fallback to initials via state would need extra state; initials are always rendered below */}}
          />
          <Text style={[styles.planInitialsFallback, { color }]}>{initials}</Text>
        </View>

        <View style={styles.planInfo}>
          <Text style={styles.planName} numberOfLines={1}>
            {plan.plan.plan_name}
          </Text>
          <Text style={styles.planCompany} numberOfLines={1}>
            {plan.company.company_name}
          </Text>
        </View>

        <View style={styles.planPriceWrap}>
          <Text style={styles.planPremium}>{formatPremium(plan.totalPayablePremium)}</Text>
          <Text style={styles.planCover}>{formatCover(plan.coverAmount)} cover</Text>
          {plan.totalDiscount > 0 && (
            <Text style={styles.planDiscount}>
              Save ₹{plan.totalDiscount.toLocaleString('en-IN')}
            </Text>
          )}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Features */}
      {includes.length > 0 && (
        <View style={styles.featureList}>
          {includes.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <CheckIcon />
              <Text style={styles.featureText} numberOfLines={2}>{f}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.planActions}>
        <Pressable
          style={({ pressed }) => [styles.viewBtn, pressed && styles.pressed]}>
          <Text style={styles.viewBtnText}>View Details</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.buyBtn, pressed && styles.pressed]}>
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ─── Skeleton card ──────────────────────────────────────── */

function SkeletonCard() {
  return (
    <View style={[styles.planCard, styles.skeletonCard]}>
      <View style={styles.planTop}>
        <View style={[styles.planAvatar, styles.skeletonBlock]} />
        <View style={styles.planInfo}>
          <View style={[styles.skeletonBlock, { height: 14, width: '60%', borderRadius: 6, marginBottom: 8 }]} />
          <View style={[styles.skeletonBlock, { height: 11, width: '40%', borderRadius: 6 }]} />
        </View>
        <View style={styles.planPriceWrap}>
          <View style={[styles.skeletonBlock, { height: 16, width: 80, borderRadius: 6, marginBottom: 6 }]} />
          <View style={[styles.skeletonBlock, { height: 11, width: 60, borderRadius: 6 }]} />
        </View>
      </View>
      <View style={[styles.skeletonBlock, { height: 1, marginVertical: 12 }]} />
      {[0, 1, 2].map(i => (
        <View key={i} style={[styles.skeletonBlock, { height: 11, borderRadius: 6, marginBottom: 8, width: `${75 + i * 8}%` }]} />
      ))}
    </View>
  );
}

/* ─── Screen ─────────────────────────────────────────────── */

function QuoteScreen({ formData, onBack }: Props) {
  const { plans, loading, loadedCount, totalCount, error } = useHealthQuotes(formData);
  const [sortBy, setSortBy] = useState<SortKey>('asc');

  const sortedPlans = useMemo(() => {
    const copy = [...plans];
    copy.sort((a, b) =>
      sortBy === 'asc'
        ? a.totalPayablePremium - b.totalPayablePremium
        : b.totalPayablePremium - a.totalPayablePremium,
    );
    return copy;
  }, [plans, sortBy]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
          <BackIcon />
        </Pressable>
        <Text style={styles.headerTitle}>Health Quotes</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <Text style={styles.summaryText}>
          {memberSummary(formData)} · {formData.coverAmount} cover · {formData.city || 'Your city'}
        </Text>
        <Pressable onPress={onBack}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>

      {/* Loading bar */}
      {loading && (
        <LoadingBar loaded={loadedCount} total={totalCount} />
      )}

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>

        {/* Error state */}
        {error && !loading && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Could not load plans</Text>
            <Text style={styles.errorSub}>{error}</Text>
          </View>
        )}

        {/* Sort + count row */}
        {(plans.length > 0 || loading) && (
          <View style={styles.sortRow}>
            <Text style={styles.resultCount}>
              {loading
                ? `${plans.length} plans found so far…`
                : `${plans.length} plans found for you`}
            </Text>
            <Pressable
              onPress={() => setSortBy(s => s === 'asc' ? 'desc' : 'asc')}
              style={styles.sortChip}>
              <Text style={styles.sortChipText}>
                Premium {sortBy === 'asc' ? '↑ Low–High' : '↓ High–Low'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Plan cards */}
        {sortedPlans.map((plan, i) => (
          <PlanCard key={`${plan.companyId}-${plan.planId}-${i}`} plan={plan} />
        ))}

        {/* Skeleton cards while loading */}
        {loading && plans.length === 0 && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* Spinner while more results are still coming */}
        {loading && plans.length > 0 && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color="#6B21A8" />
            <Text style={styles.loadingMoreText}>Loading more plans…</Text>
          </View>
        )}

        {/* Empty state */}
        {!loading && !error && plans.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No plans found</Text>
            <Text style={styles.emptySub}>
              No plans matched your requirements. Try adjusting the cover amount or member details.
            </Text>
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            * Premiums shown are indicative. Final premium depends on age, medical history, and insurer norms.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F4F4' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#14532D',
  },
  headerSpacer: { width: 34 },

  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryText: { fontSize: 13, color: '#374151', flex: 1, marginRight: 12 },
  editText: { fontSize: 13, fontWeight: '700', color: '#6B21A8' },

  loadingBarWrap: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  loadingBarTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  loadingBarFill: {
    height: 4,
    backgroundColor: '#6B21A8',
    borderRadius: 2,
  },
  loadingBarText: { fontSize: 12, color: '#6B7280' },

  scroll: { flex: 1 },
  content: { paddingBottom: 32, paddingTop: 4 },

  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultCount: { fontSize: 13, color: '#666666', flex: 1 },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#6B21A8',
    backgroundColor: '#F3E8FF',
  },
  sortChipText: { fontSize: 12, color: '#6B21A8', fontWeight: '700' },

  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  skeletonCard: {
    opacity: 0.6,
  },
  skeletonBlock: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },

  planTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  planAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  planLogo: {
    width: 48,
    height: 48,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  planInitialsFallback: {
    fontSize: 15,
    fontWeight: '800',
  },
  planInfo: { flex: 1, marginRight: 8 },
  planName: { fontSize: 14, fontWeight: '700', color: '#111111', marginBottom: 3 },
  planCompany: { fontSize: 12, color: '#666666' },
  planPriceWrap: { alignItems: 'flex-end' },
  planPremium: { fontSize: 16, fontWeight: '800', color: '#14532D' },
  planCover: { fontSize: 11, color: '#666666', marginTop: 2 },
  planDiscount: {
    fontSize: 11,
    color: '#22C55E',
    fontWeight: '600',
    marginTop: 2,
  },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 },

  featureList: { gap: 7, marginBottom: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  featureText: { fontSize: 12, color: '#374151', flex: 1, lineHeight: 17 },

  planActions: { flexDirection: 'row', gap: 10 },
  viewBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#6B21A8',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  viewBtnText: { color: '#6B21A8', fontWeight: '700', fontSize: 13 },
  buyBtn: {
    flex: 1,
    backgroundColor: '#6B21A8',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  buyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  pressed: { opacity: 0.82 },

  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loadingMoreText: { fontSize: 13, color: '#6B21A8', fontWeight: '500' },

  errorBox: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    alignItems: 'center',
  },
  errorTitle: { fontSize: 15, fontWeight: '700', color: '#B91C1C', marginBottom: 6 },
  errorSub: { fontSize: 13, color: '#7F1D1D', textAlign: 'center', lineHeight: 18 },

  emptyBox: {
    margin: 16,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 19 },

  disclaimer: { paddingHorizontal: 16, paddingTop: 4 },
  disclaimerText: { fontSize: 11, color: '#9CA3AF', lineHeight: 16 },
});

export default QuoteScreen;

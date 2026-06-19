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

import { SuperTopUpFormData } from '../navigation/SuperTopUpStack';
import { PremiumTier, SuperTopUpPlan, getLogoUri, useSuperTopUpQuotes } from '../hooks/useSuperTopUpQuotes';

type SortKey = 'asc' | 'desc';

const COMPANY_COLORS = [
  '#FF6B35', '#0057A8', '#00A86B', '#7C3AED',
  '#E11D48', '#0891B2', '#D97706', '#059669',
];

type Props = {
  formData: SuperTopUpFormData;
  onBack: () => void;
};

/* ─── Helpers ───────────────────────────────────────────── */

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getColor(companyId: string): string {
  return COMPANY_COLORS[hashCode(companyId) % COMPANY_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
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

function formatDeductible(val: string): string {
  const n = Number(val);
  if (isNaN(n)) return val;
  if (n >= 100000) return `₹${n / 100000} Lakh`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

type FlatCard = { plan: SuperTopUpPlan; tier: PremiumTier };

function memberSummary(formData: SuperTopUpFormData): string {
  const count =
    (formData.includeSelf ? 1 : 0) +
    (formData.includeSpouse ? 1 : 0) +
    formData.childrenCount;
  return `${count} member${count !== 1 ? 's' : ''}`;
}

function parseOtherDetails(raw: string): Record<string, string> {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/* ─── Icons ─────────────────────────────────────────────── */

function BackIcon() {
  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Path d="M15 18L9 12L15 6" fill="none" stroke="#0C4A6E"
        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg height={13} viewBox="0 0 24 24" width={13}>
      <Path d="M20 6L9 17l-5-5" fill="none" stroke="#22C55E"
        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
    </Svg>
  );
}

function CrossIcon() {
  return (
    <Svg height={13} viewBox="0 0 24 24" width={13}>
      <Path d="M18 6L6 18M6 6l12 12" fill="none" stroke="#EF4444"
        strokeLinecap="round" strokeWidth="2.5" />
    </Svg>
  );
}

/* ─── Loading bar ────────────────────────────────────────── */

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

function PlanCard({ plan, tier }: { plan: SuperTopUpPlan; tier: PremiumTier }) {
  const [showDetails, setShowDetails] = useState(false);
  const color = getColor(plan.companyId);
  const initials = getInitials(plan.companyName);
  const logoUri = getLogoUri(plan.logoUrl);

  const includes = plan.features.map(f => f.includes).filter((v): v is string => !!v).slice(0, 3);
  const excludes = plan.features.map(f => f.excludes).filter((v): v is string => !!v).slice(0, 3);
  const otherDetails = parseOtherDetails(plan.otherDetails ?? '');
  const detailEntries = Object.entries(otherDetails);

  return (
    <View style={styles.planCard}>
      {/* ── Top row ── */}
      <View style={styles.planTop}>
        <View style={[styles.planAvatar, { backgroundColor: color + '20' }]}>
          <Image source={{ uri: logoUri }} style={styles.planLogo} resizeMode="contain" onError={() => {}} />
          <Text style={[styles.planInitialsFallback, { color }]}>{initials}</Text>
        </View>
        <View style={styles.planInfo}>
          <Text style={styles.planName} numberOfLines={2}>{plan.planName}</Text>
          <Text style={styles.planCompany}>{plan.companyName}</Text>
        </View>
        <View style={[styles.coverBadge, { backgroundColor: color + '15', borderColor: color + '40' }]}>
          <Text style={[styles.coverBadgeText, { color }]}>{formatCover(plan.coverAmount)}</Text>
          <Text style={[styles.coverBadgeSub, { color }]}>Cover</Text>
        </View>
      </View>

      {/* ── Members row ── */}
      <View style={styles.membersRow}>
        <Text style={styles.membersText}>
          {plan.adults} Adult{plan.adults !== 1 ? 's' : ''}
          {plan.children > 0 ? ` · ${plan.children} Child${plan.children !== 1 ? 'ren' : ''}` : ''}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* ── Premium & Deductible ── */}
      <View style={styles.premiumRow}>
        <View style={styles.premiumBox}>
          <Text style={styles.premiumBoxLabel}>Premium</Text>
          <Text style={styles.premiumBoxValue}>{formatPremium(tier.premium)}</Text>
        </View>
        <View style={styles.premiumDividerV} />
        <View style={styles.premiumBox}>
          <Text style={styles.premiumBoxLabel}>Deductible</Text>
          <Text style={styles.deductibleBoxValue}>{formatDeductible(tier.deductible)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* ── Features ── */}
      {includes.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Covered</Text>
          <View style={styles.featureList}>
            {includes.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <CheckIcon />
                <Text style={styles.featureText} numberOfLines={2}>{f}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {excludes.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { marginTop: 10 }]}>Exclusions</Text>
          <View style={styles.featureList}>
            {excludes.map((e, i) => (
              <View key={i} style={styles.featureRow}>
                <CrossIcon />
                <Text style={[styles.featureText, styles.excludeText]} numberOfLines={2}>{e}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* ── Other details (expandable) ── */}
      {detailEntries.length > 0 && (
        <>
          {/* <Pressable
            onPress={() => setShowDetails(v => !v)}
            style={styles.detailsToggle}>
            <Text style={styles.detailsToggleText}>
              {showDetails ? 'Hide Coverage Details ▲' : 'Show Coverage Details ▼'}
            </Text>
          </Pressable> */}

          {showDetails && (
            <View style={styles.detailsGrid}>
              {detailEntries.map(([key, val]) => (
                <View key={key} style={styles.detailsRow}>
                  <Text style={styles.detailsKey}>{key}</Text>
                  <Text
                    style={[
                      styles.detailsVal,
                      val === 'Not covered' || val === 'Not stated'
                        ? styles.detailsValNA
                        : styles.detailsValOk,
                    ]}>
                    {val}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <View style={styles.divider} />

      {/* ── Actions ── */}
      <View style={styles.planActions}>
        <Pressable style={({ pressed }) => [styles.viewBtn, pressed && styles.pressed]}>
          <Text style={styles.viewBtnText}>View Details</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.buyBtn, pressed && styles.pressed]}>
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ─── Skeleton card ──────────────────────────────────────── */

function SkeletonCard() {
  return (
    <View style={[styles.planCard, { opacity: 0.6 }]}>
      <View style={styles.planTop}>
        <View style={[{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#E5E7EB' }]} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ height: 14, width: '65%', borderRadius: 6, backgroundColor: '#E5E7EB', marginBottom: 8 }} />
          <View style={{ height: 11, width: '40%', borderRadius: 6, backgroundColor: '#E5E7EB' }} />
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 }} />
      {[0, 1].map(i => (
        <View key={i} style={{ height: 11, borderRadius: 6, backgroundColor: '#E5E7EB', marginBottom: 8, width: `${70 + i * 15}%` }} />
      ))}
    </View>
  );
}

/* ─── Screen ─────────────────────────────────────────────── */

function QuoteScreen({ formData, onBack }: Props) {
  const { plans, loading, loadedCount, totalCount, error } = useSuperTopUpQuotes(formData);
  const [sortBy, setSortBy] = useState<SortKey>('asc');

  const flatCards = useMemo<FlatCard[]>(() => {
    const cards: FlatCard[] = plans.flatMap(plan =>
      (plan.premiums ?? []).map(tier => ({ plan, tier })),
    );
    cards.sort((a, b) =>
      sortBy === 'asc'
        ? a.tier.premium - b.tier.premium
        : b.tier.premium - a.tier.premium,
    );
    return cards;
  }, [plans, sortBy]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
          <BackIcon />
        </Pressable>
        <Text style={styles.headerTitle}>Super Top-Up Quotes</Text>
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

      {loading && <LoadingBar loaded={loadedCount} total={totalCount} />}

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {error && !loading && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Could not load plans</Text>
            <Text style={styles.errorSub}>{error}</Text>
          </View>
        )}

        {(flatCards.length > 0 || loading) && (
          <View style={styles.sortRow}>
            <Text style={styles.resultCount}>
              {loading ? `${flatCards.length} options so far…` : `${flatCards.length} options found for you`}
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

        {flatCards.map((card, i) => (
          <PlanCard key={`${card.plan.companyId}-${card.plan.planId}-${card.tier.deductible}-${i}`} plan={card.plan} tier={card.tier} />
        ))}

        {loading && flatCards.length === 0 && (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        )}

        {loading && flatCards.length > 0 && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color="#0369A1" />
            <Text style={styles.loadingMoreText}>Loading more plans…</Text>
          </View>
        )}

        {!loading && !error && flatCards.length === 0 && (
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
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E0F2FE', paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.65)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#0C4A6E' },
  headerSpacer: { width: 34 },

  summaryStrip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  summaryText: { fontSize: 13, color: '#374151', flex: 1, marginRight: 12 },
  editText: { fontSize: 13, fontWeight: '700', color: '#0369A1' },

  loadingBarWrap: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  loadingBarTrack: {
    height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, overflow: 'hidden', marginBottom: 6,
  },
  loadingBarFill: { height: 4, backgroundColor: '#0369A1', borderRadius: 2 },
  loadingBarText: { fontSize: 12, color: '#6B7280' },

  scroll: { flex: 1 },
  content: { paddingBottom: 32, paddingTop: 4 },

  sortRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  resultCount: { fontSize: 13, color: '#666666', flex: 1 },
  sortChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: '#0369A1', backgroundColor: '#E0F2FE',
  },
  sortChipText: { fontSize: 12, color: '#0369A1', fontWeight: '700' },

  planCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    marginHorizontal: 16, marginBottom: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },

  planTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  planAvatar: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12, overflow: 'hidden', position: 'relative',
  },
  planLogo: { width: 48, height: 48, position: 'absolute', top: 0, left: 0 },
  planInitialsFallback: { fontSize: 15, fontWeight: '800' },
  planInfo: { flex: 1, marginRight: 8 },
  planName: { fontSize: 13, fontWeight: '700', color: '#111111', marginBottom: 3, lineHeight: 18 },
  planCompany: { fontSize: 12, color: '#666666' },

  coverBadge: {
    alignItems: 'center', borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  coverBadgeText: { fontSize: 14, fontWeight: '800' },
  coverBadgeSub: { fontSize: 10, fontWeight: '600', opacity: 0.8 },

  membersRow: { marginBottom: 4 },
  membersText: { fontSize: 12, color: '#6B7280' },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },

  /* Premium / Deductible row */
  premiumRow: {
    flexDirection: 'row', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, overflow: 'hidden', backgroundColor: '#F8FAFF',
  },
  premiumBox: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
  },
  premiumDividerV: { width: 1, backgroundColor: '#E5E7EB', marginVertical: 10 },
  premiumBoxLabel: {
    fontSize: 10, fontWeight: '600', color: '#9CA3AF',
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4,
  },
  premiumBoxValue: { fontSize: 18, fontWeight: '800', color: '#0C4A6E' },
  deductibleBoxValue: { fontSize: 18, fontWeight: '800', color: '#0369A1' },

  /* Features */
  featureList: { gap: 6 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  featureText: { fontSize: 12, color: '#374151', flex: 1, lineHeight: 17 },
  excludeText: { color: '#6B7280' },

  /* Coverage details */
  detailsToggle: { marginTop: 12, alignSelf: 'flex-start' },
  detailsToggleText: { fontSize: 12, color: '#0369A1', fontWeight: '600' },
  detailsGrid: {
    marginTop: 10, borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10, overflow: 'hidden',
  },
  detailsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 9,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  detailsKey: { fontSize: 12, color: '#374151', flex: 1, marginRight: 8 },
  detailsVal: { fontSize: 12, fontWeight: '600', textAlign: 'right', flexShrink: 1 },
  detailsValOk: { color: '#0369A1' },
  detailsValNA: { color: '#9CA3AF' },

  /* Actions */
  planActions: { flexDirection: 'row', gap: 10 },
  viewBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#0369A1',
    borderRadius: 10, paddingVertical: 11, alignItems: 'center',
  },
  viewBtnText: { color: '#0369A1', fontWeight: '700', fontSize: 13 },
  buyBtn: {
    flex: 1, backgroundColor: '#0369A1',
    borderRadius: 10, paddingVertical: 11, alignItems: 'center',
  },
  buyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  pressed: { opacity: 0.82 },

  loadingMore: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, paddingVertical: 16,
  },
  loadingMoreText: { fontSize: 13, color: '#0369A1', fontWeight: '500' },

  errorBox: {
    margin: 16, padding: 20, backgroundColor: '#FEF2F2',
    borderRadius: 12, alignItems: 'center',
  },
  errorTitle: { fontSize: 15, fontWeight: '700', color: '#B91C1C', marginBottom: 6 },
  errorSub: { fontSize: 13, color: '#7F1D1D', textAlign: 'center', lineHeight: 18 },

  emptyBox: {
    margin: 16, padding: 24, backgroundColor: '#FFFFFF',
    borderRadius: 12, alignItems: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 19 },

  disclaimer: { paddingHorizontal: 16, paddingTop: 4 },
  disclaimerText: { fontSize: 11, color: '#9CA3AF', lineHeight: 16 },
});

export default QuoteScreen;

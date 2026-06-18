import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { inter18 } from '../../../core/theme/typography';
import {
  mapPopularToTopPicks,
  useServiceHomePopular,
  type TopPickCardItem,
} from '../hooks/useServiceHomePopular';

const PURPLE = '#5B21B6';

type Props = {
  /** Defaults to "Top picks for you" (cart). Checkout may pass "Top Pick for you". */
  title?: string;
};

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
        <Text style={[styles.recPriceBtnText, inter18('bold')]}>
          ₹{rec.price.toLocaleString('en-IN')}
        </Text>
      </Pressable>
    </View>
  );
}

export default function TopPicksCarousel({ title = 'Top picks for you' }: Props) {
  const { popular, loading, error } = useServiceHomePopular();
  const items = useMemo(() => mapPopularToTopPicks(popular), [popular]);

  if (loading) {
    return (
      <View style={styles.recSection}>
        <Text style={[styles.sectionTitle, inter18('bold')]}>{title}</Text>
        <View style={styles.recLoadingRow}>
          <ActivityIndicator size="small" color={PURPLE} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.recSection}>
        <Text style={[styles.sectionTitle, inter18('bold')]}>{title}</Text>
        <Text style={[styles.recErrorText, inter18('regular')]}>{error}</Text>
      </View>
    );
  }

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
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  recSection: {
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 10,
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

  recLoadingRow: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },

  recErrorText: {
    fontSize: 12,
    color: '#6B7280',
    paddingVertical: 8,
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
});

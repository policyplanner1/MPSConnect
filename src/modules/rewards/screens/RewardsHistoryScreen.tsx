import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import RewardsBalanceCard from '../components/RewardsBalanceCard';
import RewardsFilterTabs from '../components/RewardsFilterTabs';
import RewardsHeader from '../components/RewardsHeader';
import RewardsHistoryCard from '../components/RewardsHistoryCard';
import RewardsReferralBanner from '../components/RewardsReferralBanner';
import { useRewards } from '../hooks/useRewards';
import { inter18 } from '../../../core/theme/typography';

type RewardsHistoryScreenProps = {
  onBack?: () => void;
  onReferNow?: () => void;
};

function RewardsHistoryScreen({ onBack, onReferNow }: RewardsHistoryScreenProps) {
  const { balance, transactions, loading, filter, setFilter } = useRewards();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <RewardsHeader onBack={onBack} title="Reward History" />

        {loading || !balance ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#6B4EFF" size="small" />
          </View>
        ) : (
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <RewardsBalanceCard
              coins={balance.coins}
              conversionLabel={balance.conversionLabel}
              expiringCoins={balance.expiringCoins}
              expiryDate={balance.expiryDate}
            />

            <Text style={[styles.sectionTitle, inter18('semiBold')]}>
              Transaction History
            </Text>

            <RewardsFilterTabs activeFilter={filter} onFilterChange={setFilter} />

            <View style={styles.list}>
              {transactions.length === 0 ? (
                <Text style={[styles.emptyText, inter18('regular')]}>
                  No transactions in this category
                </Text>
              ) : (
                transactions.map(item => (
                  <RewardsHistoryCard
                    key={item.id}
                    amount={item.amount}
                    dateLabel={item.dateLabel}
                    subtitle={item.subtitle}
                    title={item.title}
                    yearLabel={item.yearLabel}
                  />
                ))
              )}
            </View>

            <RewardsReferralBanner onReferNow={onReferNow} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3EEFF',
  },
  screen: {
    flex: 1,
    backgroundColor: '#F3EEFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 15,
    color: '#1F2937',
    marginTop: 4,
  },
  list: {
    gap: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 13,
    paddingVertical: 20,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RewardsHistoryScreen;

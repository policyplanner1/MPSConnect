import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalculatorHeader from '../../components/CalculatorHeader';
import RecommendationCard from '../../components/RecommendationCard';
import type { FinancialSnapshot } from '../../types/financialPlanner';
import { buildRecommendations } from '../../utils/financialPlannerEngine';
import { inter18 } from '../../../../core/theme/typography';

type RecommendationsScreenProps = {
  snapshot: FinancialSnapshot;
  onBack: () => void;
  onScheduleFollowUp: () => void;
  onCreateLead: () => void;
};

function RecommendationsScreen({
  snapshot,
  onBack,
  onScheduleFollowUp,
  onCreateLead,
}: RecommendationsScreenProps) {
  const items = useMemo(() => buildRecommendations(snapshot), [snapshot]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="PlanWealth" />
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, inter18('bold')]}>Recommendations</Text>
        <Text style={[styles.sub, inter18('regular')]}>
          Based on the customer's financial profile.
        </Text>

        <View style={styles.list}>
          {items.map(item => (
            <RecommendationCard
              key={item.id}
              item={item}
              onPress={() =>
                Alert.alert(item.title, item.description, [{ text: 'OK' }])
              }
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={onScheduleFollowUp}
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}>
          <Text style={[styles.secondaryBtnText, inter18('semiBold')]}>Schedule Follow-up</Text>
        </Pressable>
        <Pressable
          onPress={onCreateLead}
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}>
          <Text style={[styles.primaryBtnText, inter18('bold')]}>Create Lead</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F7' },
  scroll: { padding: 16, paddingBottom: 24, gap: 14 },
  heading: { fontSize: 22, color: '#111111' },
  sub: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  list: { gap: 12, marginTop: 4 },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: { fontSize: 13, color: '#2563EB' },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 13, color: '#FFFFFF' },
  btnPressed: { opacity: 0.88 },
});

export default RecommendationsScreen;

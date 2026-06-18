import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import NotificationCard from '../components/NotificationCard';
import NotificationHeader from '../components/NotificationHeader';
import { useNotifications } from '../hooks/useNotifications';
import { inter18 } from '../../../core/theme/typography';

type NotificationScreenProps = {
  onBack?: () => void;
  onOpenOrder?: (parentOrderId: string) => void;
};

function NotificationScreen({ onBack, onOpenOrder }: NotificationScreenProps) {
  const { notifications, loading, cycleFilter } = useNotifications();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <NotificationHeader onBack={onBack} onFilterPress={cycleFilter} />

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#5E02AF" size="small" />
          </View>
        ) : (
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={[styles.emptyText, inter18('medium')]}>
                  No notifications yet
                </Text>
              </View>
            ) : (
              notifications.map(item => (
                <NotificationCard
                  key={item.id}
                  body={item.body}
                  thumbnail={item.thumbnail ?? null}
                  timestamp={item.timestamp}
                  title={item.title}
                  variant={item.variant}
                  onPress={() => {
                    const data = item.data ?? {};
                    if (data.type === 'order_status' && typeof data.parent_order_id === 'string') {
                      onOpenOrder?.(data.parent_order_id);
                    }
                  }}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    paddingTop: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default NotificationScreen;

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabName = 'Home' | 'Bundles' | 'Services';

type TabNavigatorProps = {
  onLogout: () => void;
};

function TabNavigator({ onLogout }: TabNavigatorProps) {
  const [activeTab, setActiveTab] = useState<TabName>('Home');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <Text style={styles.title}>{activeTab} Screen</Text>
        <Text style={styles.subtitle}>
          This is the {activeTab.toLowerCase()} area of your app.
        </Text>

        <Pressable onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Back to Auth Flow</Text>
        </Pressable>
      </View>

      <View style={styles.tabBar}>
        {(['Home', 'Bundles', 'Services'] as TabName[]).map(tab => {
          const isActive = tab === activeTab;

          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, isActive ? styles.activeTabButton : undefined]}>
              <Text
                style={[styles.tabLabel, isActive ? styles.activeTabLabel : undefined]}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fffaf5',
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: '#111827',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0e6dc',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#fd8b51',
  },
  tabLabel: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: '#ffffff',
  },
});

export default TabNavigator;

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppScreenHeader from '../../../components/AppScreenHeader';
import AuthButton from '../../auth/components/AuthButton';
import { inter18 } from '../../../core/theme/typography';
import { getProfileInitials, useUserProfile } from '../hooks/useUserProfile';

type ProfileScreenProps = {
  onBack: () => void;
  onLogout?: () => void | Promise<void>;
};

// Static for now (replace with store link when available).
const APP_LINK = 'https://mpsconnect.app';

function ProfileScreen({ onBack, onLogout }: ProfileScreenProps) {
  const { profile, loading, error, refresh } = useUserProfile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    if (!onLogout || isLoggingOut) {
      return;
    }

    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await onLogout();
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Get MPS Connect: ${APP_LINK}`,
        // Note: on iOS/Android the share sheet UI varies by platform.
      });
    } catch {
      // User cancelled share sheet — ignore.
    }
  };

  const initials = getProfileInitials(profile?.name);
  const phone = profile?.contactNumber?.trim() || '—';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <AppScreenHeader variant="title" title="Profile" onBack={onBack} />

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color="#5E02AF" size="small" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={[styles.errorText, inter18('medium')]}>{error}</Text>
            <Pressable onPress={() => void refresh()} style={styles.retryBtn}>
              <Text style={[styles.retryText, inter18('semiBold')]}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarFallback}>
                <Text style={[styles.avatarInitials, inter18('bold')]}>{initials}</Text>
              </View>
            </View>

            <Text style={[styles.name, inter18('bold')]}>{profile?.name ?? 'User'}</Text>
            <Text style={[styles.phone, inter18('regular')]}>{phone}</Text>

            {profile?.email ? (
              <Text style={[styles.email, inter18('regular')]}>{profile.email}</Text>
            ) : null}

            <View style={styles.shareWrap}>
              <Pressable
                accessibilityLabel="Share app"
                onPress={handleShare}
                style={({ pressed }) => [styles.shareButton, pressed && { opacity: 0.9 }]}>
                <Text style={[styles.shareText, inter18('semiBold')]}>Share app</Text>
              </Pressable>
              <Text style={[styles.shareHint, inter18('regular')]}>
                Share this link with friends
              </Text>
            </View>

            <View style={styles.logoutWrap}>
              <AuthButton
                disabled={isLoggingOut || !onLogout}
                label={isLoggingOut ? 'Logging out...' : 'Log out'}
                onPress={handleLogout}
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryText: {
    fontSize: 14,
    color: '#5E02AF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  avatarWrap: {
    marginBottom: 20,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E8DEFF',
  },
  avatarInitials: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  phone: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  shareWrap: {
    width: '100%',
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  shareButton: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8EDF3',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareText: {
    color: '#5E02AF',
    fontSize: 15,
  },
  shareHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  logoutWrap: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 32,
  },
});

export default ProfileScreen;

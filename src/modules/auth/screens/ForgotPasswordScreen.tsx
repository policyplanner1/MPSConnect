import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { inter18 } from '../../../core/theme/typography';
import {
  getAuthErrorMessage,
  requestForgotPassword,
} from '../../../services/auth.service';
import AuthBackground from '../components/AuthBackground';
import AuthButton from '../components/AuthButton';
import AuthInput from '../components/AuthInput';
import MaterialIcon from '../components/MaterialIcon';

type ForgotPasswordScreenProps = {
  onBackToLogin: () => void;
  onOtpSent: (email: string) => void;
};

function ForgotPasswordScreen({
  onBackToLogin,
  onOtpSent,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      Alert.alert('Validation', 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await requestForgotPassword({ email: trimmed });
      Alert.alert('Success', response.message, [
        { text: 'OK', onPress: () => onOtpSent(trimmed) },
      ]);
    } catch (error) {
      Alert.alert('Error', getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthBackground>
      <View style={styles.screen}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={onBackToLogin}
            style={styles.backButton}>
            <MaterialIcon color="#111827" name="arrow-back" size={22} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={[styles.title, inter18('bold')]}>Forgot Password ?</Text>
          <Text style={[styles.subtitle, inter18('regular')]}>
            Don&apos;t worry! It happens. Please enter the email associated with
            your account.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, inter18('medium')]}>Email</Text>
            <AuthInput
              autoCapitalize="none"
              containerStyle={styles.inputField}
              editable={!isSubmitting}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Enter your email"
              value={email}
            />
          </View>

          <View style={styles.buttonWrap}>
            {isSubmitting ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color="#802091" size="small" />
              </View>
            ) : null}
            <AuthButton
              disabled={isSubmitting}
              label={isSubmitting ? 'Sending...' : 'Submit'}
              onPress={handleSubmit}
            />
          </View>
        </View>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 72,
  },
  topRow: {
    position: 'absolute',
    top: 18,
    left: 10,
    zIndex: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 30,
    shadowColor: '#64748B',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
    color: '#0B1B3A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  inputField: {
    marginTop: 2,
  },
  buttonWrap: {
    marginTop: 18,
  },
  loadingWrap: {
    marginBottom: 8,
    alignItems: 'center',
  },
});

export default ForgotPasswordScreen;

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
  resetPasswordWithOtp,
} from '../../../services/auth.service';
import AuthBackground from '../components/AuthBackground';
import AuthButton from '../components/AuthButton';
import AuthInput from '../components/AuthInput';
import MaterialIcon from '../components/MaterialIcon';

type ResetPasswordScreenProps = {
  email: string;
  otp: string;
  onBack: () => void;
  onReset: () => void;
};

function ResetPasswordScreen({
  email,
  otp,
  onBack,
  onReset,
}: ResetPasswordScreenProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordHidden, setIsNewPasswordHidden] = useState(true);
  const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Validation', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation', 'Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resetPasswordWithOtp({
        email,
        otp,
        password: newPassword,
      });
      Alert.alert('Success', response.message, [
        { text: 'OK', onPress: onReset },
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
            onPress={onBack}
            style={styles.backButton}>
            <MaterialIcon color="#111827" name="arrow-back" size={22} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={[styles.title, inter18('bold')]}>Reset Password</Text>
          <Text style={[styles.subtitle, inter18('regular')]}>
            Create a new password for{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, inter18('medium')]}>New Password</Text>
            <AuthInput
              containerStyle={styles.inputField}
              editable={!isSubmitting}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              rightElement={
                <MaterialIcon
                  color="#A3AAB8"
                  disabled={isSubmitting}
                  name={isNewPasswordHidden ? 'visibility-off' : 'visibility'}
                  onPress={() => setIsNewPasswordHidden(v => !v)}
                  size={18}
                  style={styles.eyeIcon}
                />
              }
              secureTextEntry={isNewPasswordHidden}
              style={[styles.passwordInput, inter18('regular')]}
              value={newPassword}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, inter18('medium')]}>Confirm New Password</Text>
            <AuthInput
              containerStyle={styles.inputField}
              editable={!isSubmitting}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              rightElement={
                <MaterialIcon
                  color="#A3AAB8"
                  disabled={isSubmitting}
                  name={isConfirmPasswordHidden ? 'visibility-off' : 'visibility'}
                  onPress={() => setIsConfirmPasswordHidden(v => !v)}
                  size={18}
                  style={styles.eyeIcon}
                />
              }
              secureTextEntry={isConfirmPasswordHidden}
              style={[styles.passwordInput, inter18('regular')]}
              value={confirmPassword}
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
              label={isSubmitting ? 'Resetting...' : 'Reset Password'}
              onPress={handleReset}
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
    lineHeight: 20,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  emailHighlight: {
    color: '#111827',
    fontWeight: '600',
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
  passwordInput: {
    fontSize: 14,
    color: '#111827',
  },
  eyeIcon: {
    marginLeft: 8,
  },
  buttonWrap: {
    marginTop: 18,
  },
  loadingWrap: {
    marginBottom: 8,
    alignItems: 'center',
  },
});

export default ResetPasswordScreen;

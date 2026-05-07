import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AuthBackground from '../components/AuthBackground';
import AuthButton from '../components/AuthButton';
import AuthInput from '../components/AuthInput';
import MaterialIcon from '../components/MaterialIcon';

type ResetPasswordScreenProps = {
  onReset: () => void;
};

function ResetPasswordScreen({ onReset }: ResetPasswordScreenProps) {
  const [isNewPasswordHidden, setIsNewPasswordHidden] = useState(true);
  const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(true);

  return (
    <AuthBackground>
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Don’t worry! It happens. Please enter the email associated with your
            account.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>New Password</Text>
            <AuthInput
              containerStyle={styles.inputField}
              editable={isNewPasswordHidden ? false : true}
              placeholder="Enter new password"
              rightElement={
                <MaterialIcon
                  color="#A3AAB8"
                  name={isNewPasswordHidden ? 'visibility-off' : 'visibility'}
                  onPress={() => setIsNewPasswordHidden(value => !value)}
                  size={18}
                  style={styles.eyeIcon}
                />
              }
              style={styles.passwordInput}
              value={isNewPasswordHidden ? '' : 'pass123'}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <AuthInput
              containerStyle={styles.inputField}
              editable={isConfirmPasswordHidden ? false : true}
              placeholder="Confirm new password"
              rightElement={
                <MaterialIcon
                  color="#A3AAB8"
                  name={isConfirmPasswordHidden ? 'visibility-off' : 'visibility'}
                  onPress={() => setIsConfirmPasswordHidden(value => !value)}
                  size={18}
                  style={styles.eyeIcon}
                />
              }
              style={styles.passwordInput}
              value={isConfirmPasswordHidden ? '' : 'pass123'}
            />
          </View>

          <View style={styles.buttonWrap}>
            <AuthButton label="Reset Password" onPress={onReset} />
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
  card: {
    backgroundColor: '#FFFFFFE6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 34,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
  },
  inputField: {
    marginTop: 2,
  },
  passwordInput: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
    letterSpacing: 1,
  },
  eyeIcon: {
    marginLeft: 8,
  },
  buttonWrap: {
    marginTop: 18,
  },
});

export default ResetPasswordScreen;

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AuthBackground from '../components/AuthBackground';
import AuthButton from '../components/AuthButton';
import AuthInput from '../components/AuthInput';

type ForgotPasswordScreenProps = {
  onSubmit: () => void;
};

function ForgotPasswordScreen({ onSubmit }: ForgotPasswordScreenProps) {
  return (
    <AuthBackground>
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.title}>Forgot Password ?</Text>
          <Text style={styles.subtitle}>
            Don’t worry! It happens. Please enter the email associated with your
            account.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <AuthInput
              autoCapitalize="none"
              containerStyle={styles.inputField}
              keyboardType="email-address"
              placeholder="Enter your email"
            />
          </View>

          <View style={styles.buttonWrap}>
            <AuthButton label="Submit" onPress={onSubmit} />
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
  buttonWrap: {
    marginTop: 18,
  },
});

export default ForgotPasswordScreen;

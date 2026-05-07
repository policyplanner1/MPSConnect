import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AuthBackground from '../components/AuthBackground';
import AuthButton from '../components/AuthButton';
import AuthInput from '../components/AuthInput';

type VerificationCodeScreenProps = {
  onVerify: () => void;
};

const codeDigits = ['3', '3', '3', '3'];

function VerificationCodeScreen({ onVerify }: VerificationCodeScreenProps) {
  return (
    <AuthBackground>
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.title}>Verification code</Text>
          <Text style={styles.subtitle}>
            A 4 digit code has been sent to Loisbecket@gmail.com
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

          <View style={styles.codeRow}>
            {codeDigits.map((digit, index) => (
              <View key={`${digit}-${index}`} style={styles.codeBox}>
                <Text style={styles.codeText}>{digit}</Text>
              </View>
            ))}
          </View>

          <View style={styles.buttonWrap}>
            <AuthButton label="Verify" onPress={onVerify} />
          </View>

          <View style={styles.footerRow}>
            <Pressable>
              <Text style={styles.footerText}>Resend Code</Text>
            </Pressable>
            <Text style={styles.footerText}>1:20 min left</Text>
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
    marginBottom: 12,
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
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  codeBox: {
    width: 34,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E6EAF0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#94A3B8',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
  },
  buttonWrap: {
    marginBottom: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#6B7280',
  },
});

export default VerificationCodeScreen;

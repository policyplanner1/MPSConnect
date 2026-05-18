import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { inter18 } from '../../../core/theme/typography';
import {
  getAuthErrorMessage,
  resendForgotPasswordOtp,
  verifyForgotPasswordOtp,
} from '../../../services/auth.service';
import AuthBackground from '../components/AuthBackground';
import AuthButton from '../components/AuthButton';
import MaterialIcon from '../components/MaterialIcon';

const OTP_LENGTH = 4;
const RESEND_SECONDS = 120;

type VerificationCodeScreenProps = {
  email: string;
  onBack: () => void;
  onVerified: (otp: string) => void;
};

function VerificationCodeScreen({
  email,
  onBack,
  onVerified,
}: VerificationCodeScreenProps) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const otp = digits.join('');

  const updateDigit = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      Alert.alert('Validation', 'Please enter the 4-digit code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await verifyForgotPasswordOtp({ email, otp });
      Alert.alert('Success', response.message, [
        { text: 'OK', onPress: () => onVerified(otp) },
      ]);
    } catch (error) {
      Alert.alert('Error', getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending) {
      return;
    }

    setIsResending(true);
    try {
      const response = await resendForgotPasswordOtp({ email });
      setDigits(['', '', '', '']);
      setSecondsLeft(RESEND_SECONDS);
      inputRefs.current[0]?.focus();
      Alert.alert('Success', response.message);
    } catch (error) {
      Alert.alert('Error', getAuthErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')} min left`;
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
          <Text style={[styles.title, inter18('bold')]}>Verification code</Text>
          <Text style={[styles.subtitle, inter18('regular')]}>
            A 4 digit code has been sent to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          <View style={styles.codeRow}>
            {digits.map((digit, index) => (
              <TextInput
                key={`otp-${index}`}
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                editable={!isSubmitting}
                keyboardType="number-pad"
                maxLength={1}
                onChangeText={value => updateDigit(index, value)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(index, nativeEvent.key)
                }
                style={[styles.codeInput, inter18('medium')]}
                value={digit}
              />
            ))}
          </View>

          <View style={styles.buttonWrap}>
            {isSubmitting ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color="#802091" size="small" />
              </View>
            ) : null}
            <AuthButton
              disabled={isSubmitting}
              label={isSubmitting ? 'Verifying...' : 'Verify'}
              onPress={handleVerify}
            />
          </View>

          <View style={styles.footerRow}>
            <Pressable
              disabled={secondsLeft > 0 || isResending || isSubmitting}
              onPress={handleResend}>
              <Text
                style={[
                  styles.footerText,
                  inter18('medium'),
                  secondsLeft > 0 ? styles.footerMuted : styles.footerLink,
                ]}>
                {isResending ? 'Sending...' : 'Resend Code'}
              </Text>
            </Pressable>
            <Text style={[styles.footerText, inter18('medium')]}>
              {formatTime(secondsLeft)}
            </Text>
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
    marginBottom: 20,
  },
  emailHighlight: {
    color: '#111827',
    fontWeight: '600',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  codeInput: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6EAF0',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 20,
    color: '#374151',
    shadowColor: '#94A3B8',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  buttonWrap: {
    marginBottom: 18,
  },
  loadingWrap: {
    marginBottom: 8,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
  footerMuted: {
    color: '#9CA3AF',
  },
  footerLink: {
    color: '#2563EB',
  },
});

export default VerificationCodeScreen;

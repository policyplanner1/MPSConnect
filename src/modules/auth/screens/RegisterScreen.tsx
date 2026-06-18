import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { inter18 } from '../../../core/theme/typography';
import MpscLogo from '../../../assets/images/mpsclogo.svg';
import { pingApiServer } from '../../../core/api/healthCheck';
import {
  getAuthErrorMessage,
  signupUser,
  type SignupPayload,
} from '../../../services/auth.service';
import AuthBackground from '../components/AuthBackground';
import AuthButton from '../components/AuthButton';
import AuthInput from '../components/AuthInput';
import MaterialIcon from '../components/MaterialIcon';

type RegisterScreenProps = {
  onBackToLogin: () => void;
  onViewOnboardingAgain: () => void;
};

const emptyForm: SignupPayload = {
  name: '',
  email: '',
  contactNumber: '',
  password: '',
};

function validateSignupForm(form: SignupPayload): string | null {
  if (form.name.trim().length < 2) {
    return 'Name must be at least 2 characters.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return 'Please enter a valid email address.';
  }
  if (form.contactNumber.trim().length < 10) {
    return 'Contact number must be at least 10 digits.';
  }
  if (form.password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return null;
}

function RegisterScreen({
  onBackToLogin,
  onViewOnboardingAgain: _onViewOnboardingAgain,
}: RegisterScreenProps) {
  const [form, setForm] = useState<SignupPayload>(emptyForm);
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }
    pingApiServer().then(result => {
      // eslint-disable-next-line no-console
      console.log('[API ping]', result);
    });
  }, []);

  const updateField = (field: keyof SignupPayload, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    const validationError = validateSignupForm(form);
    if (validationError) {
      Alert.alert('Validation', validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await signupUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        contactNumber: form.contactNumber.trim(),
        password: form.password,
      });

      Alert.alert(
        'Success',
        response.message ||
          'Account created. Check your email for a welcome message.',
        [{ text: 'OK', onPress: onBackToLogin }],
      );
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

        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <MpscLogo height={68} width={68} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={[styles.title, inter18('bold')]}>Sign Up</Text>
          <Text style={[styles.subtitle, inter18('regular')]}>
            Create an account to continue!
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, inter18('medium')]}>Name</Text>
            <AuthInput
              autoCapitalize="words"
              containerStyle={styles.inputField}
              editable={!isSubmitting}
              onChangeText={text => updateField('name', text)}
              placeholder="Enter your name"
              value={form.name}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, inter18('medium')]}>Email</Text>
            <AuthInput
              autoCapitalize="none"
              containerStyle={styles.inputField}
              editable={!isSubmitting}
              keyboardType="email-address"
              onChangeText={text => updateField('email', text)}
              placeholder="Enter your email"
              value={form.email}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, inter18('medium')]}>Contact Number</Text>
            <AuthInput
              containerStyle={styles.inputField}
              editable={!isSubmitting}
              keyboardType="phone-pad"
              onChangeText={text => updateField('contactNumber', text)}
              placeholder="Enter your contact number"
              value={form.contactNumber}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, inter18('medium')]}>Password</Text>
            <AuthInput
              containerStyle={styles.inputField}
              editable={!isSubmitting}
              onChangeText={text => updateField('password', text)}
              placeholder="Enter your password"
              rightElement={
                <MaterialIcon
                  color="#A3AAB8"
                  disabled={isSubmitting}
                  name={isPasswordHidden ? 'visibility-off' : 'visibility'}
                  onPress={() => setIsPasswordHidden(value => !value)}
                  size={18}
                  style={styles.eyeIcon}
                />
              }
              secureTextEntry={isPasswordHidden}
              style={[styles.passwordInput, inter18('regular')]}
              value={form.password}
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
              label={isSubmitting ? 'Registering...' : 'Register'}
              onPress={handleSignup}
            />
          </View>

          <Text style={[styles.footerBlock, inter18('regular')]}>
            <Text style={styles.footerMuted}>Already have an account?</Text>
            <Text
              onPress={isSubmitting ? undefined : onBackToLogin}
              style={[styles.loginText, inter18('bold')]}>
              {' '}
              Login
            </Text>
          </Text>
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
    paddingTop: 24,
    paddingBottom: 52,
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
  logoWrap: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9273d8',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 30,
    minHeight: 275,
    shadowColor: '#64748B',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 6,
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
    color: '#0B1B3A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  inputField: {
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  passwordInput: {
    fontSize: 14,
    color: '#111827',
  },
  eyeIcon: {
    marginLeft: 4,
  },
  buttonWrap: {
    marginTop: 20,
  },
  loadingWrap: {
    marginBottom: 8,
    alignItems: 'center',
  },
  footerBlock: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 14,
  },
  footerMuted: {
    color: '#6B7280',
  },
  loginText: {
    color: '#2563EB',
  },
});

export default RegisterScreen;

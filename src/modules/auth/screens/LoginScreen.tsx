import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { inter18 } from '../../../core/theme/typography';
import { extractUserIdFromLoginData } from '../../../core/utils/authSession';
import {
  extractCrmUserIdFromJwt,
  extractCrmUserIdFromLoginData,
  trySyncCrmUserIdFromProfile,
} from '../../../core/utils/crmUserSession';
import { logLoginStorageDebug } from '../../../core/utils/authDebugLog';
import { removeMpsOAuthSession } from '../../../core/utils/mpsOAuthStorage';
import {
  clearRememberedEmail,
  getRememberedEmail,
  removeToken,
  removeCrmUserId,
  removeUserId,
  saveCrmUserId,
  saveRememberedEmail,
  saveToken,
  saveUserId,
} from '../../../core/utils/storage';
import MpscLogo from '../../../assets/images/mpsclogo.svg';
import {
  getAuthErrorMessage,
  loginUser,
  type LoginPayload,
} from '../../../services/auth.service';
import { registerFcmTokenWithBackend } from '../../../services/pushToken.service';
import {
  ensureMpsOAuthToken,
  getMpsOAuthErrorMessage,
} from '../../../services/mpsOAuth.service';
import AuthBackground from '../components/AuthBackground';
import AuthButton from '../components/AuthButton';
import AuthInput from '../components/AuthInput';
import MaterialIcon from '../components/MaterialIcon';

function SocialIcon({ kind }: { kind: 'google' | 'facebook' | 'apple' }) {
  if (kind === 'google') {
    return (
      <Svg height={18} viewBox="0 0 24 24" width={18}>
        <Path d="M21.8 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.5c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3.1-4.2 3.1-7.2Z" fill="#4285F4" />
        <Path d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.2-2.5c-.9.6-2.1 1-3.7 1-2.8 0-5.1-1.9-5.9-4.4H2.8v2.6C4.5 19.6 8 22 12 22Z" fill="#34A853" />
        <Path d="M6.1 13.6c-.2-.6-.3-1.1-.3-1.6s.1-1.1.3-1.6V7.8H2.8C2.3 8.9 2 10 2 12s.3 3.1.8 4.2l3.3-2.6Z" fill="#FBBC04" />
        <Path d="M12 5c1.8 0 3.3.6 4.5 1.7l2.8-2.8C17.2 1.9 14.8 1 12 1 8 1 4.5 3.4 2.8 7.8l3.3 2.6C6.9 6.9 9.2 5 12 5Z" fill="#EA4335" />
      </Svg>
    );
  }

  if (kind === 'facebook') {
    return (
      <Svg height={18} viewBox="0 0 24 24" width={18}>
        <Path d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1c0 6 4.4 11 10.1 12v-8.4H7.1v-3.6h3V9.3c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.4h3.4l-.5 3.6h-2.9v8.4C19.6 23.1 24 18.1 24 12.1Z" fill="#1877F2" />
      </Svg>
    );
  }

  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Path d="M16.8 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.5-2.6-1.7-3.1-1.8-1.3-.1-2.6.8-3.2.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.5 1 8.5.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.7-.7 1.3 0 1.6.7 2.7.7 1.1 0 1.9-1 2.5-2 .8-1.2 1.1-2.4 1.1-2.5-.1 0-1.8-.7-1.8-3.2Zm-2.2-6.4c.5-.6.9-1.5.8-2.3-.8 0-1.8.6-2.4 1.2-.5.6-.9 1.5-.8 2.3.9.1 1.8-.4 2.4-1.2Z" fill="#111827" />
    </Svg>
  );
}

type LoginScreenProps = {
  onContinueToApp: () => void;
  onForgotPassword: () => void;
  onGoToRegister: () => void;
};

const emptyForm: LoginPayload = {
  email: '',
  password: '',
};

function validateLoginForm(form: LoginPayload): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return 'Please enter a valid email address.';
  }
  if (form.password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return null;
}

function LoginScreen({
  onContinueToApp,
  onForgotPassword,
  onGoToRegister,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getRememberedEmail().then(savedEmail => {
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    });
  }, []);

  const handleLogin = async () => {
    const payload: LoginPayload = {
      email: email.trim().toLowerCase(),
      password,
    };

    const validationError = validateLoginForm(payload);
    if (validationError) {
      Alert.alert('Validation', validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await removeToken();
      await removeUserId();
      await removeCrmUserId();
      await removeMpsOAuthSession();

      const response = await loginUser(payload);
      await logLoginStorageDebug('after login API (before save)', response);

      // if (!response.token) {
      //   Alert.alert('Error', 'Login succeeded but no token was returned.');
      //   return;
      // }

      // await saveToken(response.token);

      const userId = extractUserIdFromLoginData(
        response.data as Record<string, unknown> | undefined,
      );
      if (userId) {
        await saveUserId(userId);
      }

      const crmFromLogin = extractCrmUserIdFromLoginData(
        response.data as Record<string, unknown> | undefined,
      );
      if (crmFromLogin != null) {
        await saveCrmUserId(crmFromLogin);
      } else {
        const crmFromJwt = extractCrmUserIdFromJwt(response.token);
        if (crmFromJwt != null) {
          await saveCrmUserId(crmFromJwt);
        }
      }

      await trySyncCrmUserIdFromProfile();
      await logLoginStorageDebug('after user token saved', response);

      try {
        const mpsSession = await ensureMpsOAuthToken();
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('[Login] MPS OAuth session (from API, now stored):', JSON.stringify(mpsSession, null, 2));
        }
        await logLoginStorageDebug('after MPS OAuth saved', response);
      } catch (oauthError) {
        await removeToken();
        await removeUserId();
        await removeCrmUserId();
        await removeMpsOAuthSession();
        await logLoginStorageDebug('MPS OAuth failed — storage cleared');
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('[Login] MPS OAuth error:', oauthError);
        }
        Alert.alert('MPS authentication', getMpsOAuthErrorMessage(oauthError));
        return;
      }

      if (rememberMe) {
        await saveRememberedEmail(payload.email);
      } else {
        await clearRememberedEmail();
      }

      await logLoginStorageDebug('login complete — final local state', response);
      // Best-effort: register device FCM token for real push notifications.
      await registerFcmTokenWithBackend().catch(() => undefined);
      onContinueToApp();
    } catch (error) {
      Alert.alert('Error', getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthBackground>
      <View style={styles.screen}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <MpscLogo height={68} width={68} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={[styles.title, inter18('bold')]}>Login</Text>
          <Text style={[styles.subtitle, inter18('regular')]}>
            Enter your email and password to log in
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

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, inter18('medium')]}>Password</Text>
            <AuthInput
              containerStyle={styles.inputField}
              editable={!isSubmitting}
              onChangeText={setPassword}
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
              value={password}
            />
          </View>

          <View style={styles.metaRow}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}
              disabled={isSubmitting}
              onPress={() => setRememberMe(v => !v)}
              style={styles.rememberRow}>
              <View
                style={[
                  styles.checkbox,
                  rememberMe ? styles.checkboxChecked : undefined,
                ]}>
                {rememberMe ? <Text style={styles.checkMark}>✓</Text> : null}
              </View>
              <Text style={[styles.rememberText, inter18('regular')]}>
                Remember me
              </Text>
            </Pressable>

            <Pressable disabled={isSubmitting} onPress={onForgotPassword}>
              <Text style={[styles.forgotText, inter18('medium')]}>
                Forgot Password ?
              </Text>
            </Pressable>
          </View>

          <View style={styles.loginButtonWrap}>
            {isSubmitting ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color="#802091" size="small" />
              </View>
            ) : null}
            <AuthButton
              disabled={isSubmitting}
              label={isSubmitting ? 'Logging in...' : 'Login'}
              onPress={handleLogin}
            />
          </View>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={[styles.orLabel, inter18('medium')]}>Or login with</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable disabled={isSubmitting} style={styles.socialButton}>
              <SocialIcon kind="google" />
            </Pressable>
            <Pressable disabled={isSubmitting} style={styles.socialButton}>
              <SocialIcon kind="facebook" />
            </Pressable>
            <Pressable disabled={isSubmitting} style={styles.socialButton}>
              <SocialIcon kind="apple" />
            </Pressable>
            <Pressable disabled={isSubmitting} style={styles.socialButton}>
              <MaterialIcon color="#111827" name="smartphone" size={18} />
            </Pressable>
          </View>

          <Text style={[styles.footerBlock, inter18('regular')]}>
            <Text style={styles.footerMuted}>
              {"Don't have an account? "}
            </Text>
            <Text
              onPress={isSubmitting ? undefined : onGoToRegister}
              style={[styles.signUpText, inter18('bold')]}>
              Sign Up
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
    paddingTop: 20,
    paddingBottom: 52,
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
    paddingTop: 32,
    paddingBottom: 28,
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
    marginBottom: 22,
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
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 8,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#802091',
    backgroundColor: '#F3E8FF',
  },
  checkMark: {
    fontSize: 11,
    color: '#802091',
    fontWeight: '700',
    marginTop: -1,
  },
  rememberText: {
    fontSize: 13,
    color: '#6B7280',
  },
  forgotText: {
    fontSize: 13,
    color: '#2563EB',
  },
  loginButtonWrap: {
    marginTop: 22,
  },
  loadingWrap: {
    marginBottom: 8,
    alignItems: 'center',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 18,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
  },
  orLabel: {
    marginHorizontal: 14,
    fontSize: 13,
    color: '#9CA3AF',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 22,
  },
  socialButton: {
    flex: 1,
    height: 48,
    maxWidth: 76,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  footerBlock: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#6B7280',
  },
  footerMuted: {
    color: '#6B7280',
  },
  signUpText: {
    color: '#2563EB',
  },
});

export default LoginScreen;

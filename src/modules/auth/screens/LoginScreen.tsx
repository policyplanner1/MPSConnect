import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import MpscLogo from '../../../assets/images/mpsclogo.svg';
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

function LoginScreen({
  onContinueToApp,
  onForgotPassword,
  onGoToRegister,
}: LoginScreenProps) {
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const password = 'pass123';
  const passwordValue = isPasswordHidden ? '*******' : password;

  return (
    <AuthBackground>
      <View style={styles.screen}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <MpscLogo height={68} width={68} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>
            Enter your email and password to log in
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

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <AuthInput
              containerStyle={styles.inputField}
              editable={isPasswordHidden ? false : true}
              placeholder="Enter your password"
              rightElement={
                <MaterialIcon
                  color="#A3AAB8"
                  name={isPasswordHidden ? 'visibility-off' : 'visibility'}
                  onPress={() => setIsPasswordHidden(value => !value)}
                  size={18}
                  style={styles.eyeIcon}
                />
              }
              style={styles.passwordInput}
              value={isPasswordHidden ? '' : passwordValue}
            />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.rememberRow}>
              <View style={styles.checkbox} />
              <Text style={styles.rememberText}>Remember me</Text>
            </View>

            <Pressable onPress={onForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password ?</Text>
            </Pressable>
          </View>

          <View style={styles.loginButtonWrap}>
            <AuthButton label="Login" onPress={onContinueToApp} />
          </View>

          <Text style={styles.orText}>Or login with</Text>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialButton}>
              <SocialIcon kind="google" />
            </Pressable>
            <Pressable style={styles.socialButton}>
              <SocialIcon kind="facebook" />
            </Pressable>
            <Pressable style={styles.socialButton}>
              <SocialIcon kind="apple" />
            </Pressable>
            <Pressable style={styles.socialButton}>
              <MaterialIcon color="#111827" name="smartphone" size={18} />
            </Pressable>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Pressable onPress={onGoToRegister}>
              <Text style={styles.signUpText}> Sign Up</Text>
            </Pressable>
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
    backgroundColor: '#FFFFFFE6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 34,
    paddingBottom: 30,
    minHeight: 275,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 10,
  },
  inputField: {
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 14,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 2,
    marginRight: 6,
    backgroundColor: '#FFFFFF',
  },
  rememberText: {
    fontSize: 13,
    color: '#6B7280',
  },
  forgotText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '500',
  },
  loginButtonWrap: {
    marginTop: 20,
  },
  orText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  socialButton: {
    width: 45,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  signUpText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '700',
  },
});

export default LoginScreen;

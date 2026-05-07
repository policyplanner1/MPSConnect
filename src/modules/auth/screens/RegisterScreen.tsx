import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MpscLogo from '../../../assets/images/mpsclogo.svg';
import AuthBackground from '../components/AuthBackground';
import AuthButton from '../components/AuthButton';
import AuthInput from '../components/AuthInput';
import MaterialIcon from '../components/MaterialIcon';

type RegisterScreenProps = {
  onBackToLogin: () => void;
  onViewOnboardingAgain: () => void;
};

function RegisterScreen({
  onBackToLogin,
}: RegisterScreenProps) {
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const password = 'pass123';
  const passwordValue = isPasswordHidden ? '*******' : password;

  return (
    <AuthBackground>
      <View style={styles.screen}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            onPress={onBackToLogin}
            style={styles.backButton}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </Pressable>
        </View>

        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <MpscLogo height={68} width={68} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>
            Create an account to continue!
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Name</Text>
            <AuthInput
              containerStyle={styles.inputField}
              placeholder="Enter your name"
            />
          </View>

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
            <Text style={styles.label}>Contact Number</Text>
            <AuthInput
              containerStyle={styles.inputField}
              keyboardType="phone-pad"
              placeholder="Enter your contact number"
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

          <View style={styles.buttonWrap}>
            <AuthButton label="Register" onPress={onBackToLogin} />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Pressable onPress={onBackToLogin}>
              <Text style={styles.loginText}> Login</Text>
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
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginTop: -2,
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
    marginBottom: 6,
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
    marginLeft: 4,
  },
  buttonWrap: {
    marginTop: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  loginText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '700',
  },
});

export default RegisterScreen;

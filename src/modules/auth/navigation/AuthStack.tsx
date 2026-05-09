import React, { useEffect, useState } from 'react';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import SplashScreen from '../screens/SplashScreen';
import VerificationCodeScreen from '../screens/VerificationCodeScreen';
import ServicesStack from '../../services/navigation/ServicesStack';

export type AuthScreenName =
  | 'Splash'
  | 'Onboarding'
  | 'Login'
  | 'Register'
  | 'ForgotPassword'
  | 'VerificationCode'
  | 'ResetPassword'
  | 'Home';

function AuthStack() {
  const [currentScreen, setCurrentScreen] =
    useState<AuthScreenName>('Splash');

  useEffect(() => {
    if (currentScreen !== 'Splash') {
      return;
    }

    const timeoutId = setTimeout(() => {
      setCurrentScreen('Onboarding');
    }, 1600);

    return () => clearTimeout(timeoutId);
  }, [currentScreen]);

  if (currentScreen === 'Splash') {
    return <SplashScreen />;
  }

  if (currentScreen === 'Login') {
    return (
      <LoginScreen
        onContinueToApp={() => setCurrentScreen('Home')}
        onForgotPassword={() => setCurrentScreen('ForgotPassword')}
        onGoToRegister={() => setCurrentScreen('Register')}
      />
    );
  }

  if (currentScreen === 'Register') {
    return (
      <RegisterScreen
        onBackToLogin={() => setCurrentScreen('Login')}
        onViewOnboardingAgain={() => setCurrentScreen('Onboarding')}
      />
    );
  }

  if (currentScreen === 'ForgotPassword') {
    return (
      <ForgotPasswordScreen
        onSubmit={() => setCurrentScreen('VerificationCode')}
      />
    );
  }

  if (currentScreen === 'VerificationCode') {
    return (
      <VerificationCodeScreen
        onVerify={() => setCurrentScreen('ResetPassword')}
      />
    );
  }

  if (currentScreen === 'ResetPassword') {
    return (
      <ResetPasswordScreen
        onReset={() => setCurrentScreen('Login')}
      />
    );
  }

  if (currentScreen === 'Home') {
    return <ServicesStack onLogout={() => setCurrentScreen('Login')} />;
  }

  return (
    <OnboardingScreen
      onSignIn={() => setCurrentScreen('Login')}
      onSkip={() => setCurrentScreen('Login')}
    />
  );
}

export default AuthStack;

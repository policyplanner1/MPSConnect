import React, { useEffect, useState } from 'react';
import { getToken, removeToken } from '../../../core/utils/storage';
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
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');

  useEffect(() => {
    if (currentScreen !== 'Splash') {
      return;
    }

    let isMounted = true;

    const bootstrap = async () => {
      const token = await getToken();
      await new Promise<void>(resolve => {
        setTimeout(resolve, 1600);
      });

      if (!isMounted) {
        return;
      }

      if (token) {
        setCurrentScreen('Home');
        return;
      }

      setCurrentScreen('Onboarding');
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [currentScreen]);

  const handleLogout = async () => {
    await removeToken();
    setCurrentScreen('Login');
  };

  const clearResetFlow = () => {
    setResetEmail('');
    setResetOtp('');
  };

  if (currentScreen === 'Splash') {
    return <SplashScreen />;
  }

  if (currentScreen === 'Login') {
    return (
      <LoginScreen
        onContinueToApp={() => setCurrentScreen('Home')}
        onForgotPassword={() => {
          clearResetFlow();
          setCurrentScreen('ForgotPassword');
        }}
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
        onBackToLogin={() => setCurrentScreen('Login')}
        onOtpSent={email => {
          setResetEmail(email);
          setResetOtp('');
          setCurrentScreen('VerificationCode');
        }}
      />
    );
  }

  if (currentScreen === 'VerificationCode') {
    return (
      <VerificationCodeScreen
        email={resetEmail}
        onBack={() => setCurrentScreen('ForgotPassword')}
        onVerified={otp => {
          setResetOtp(otp);
          setCurrentScreen('ResetPassword');
        }}
      />
    );
  }

  if (currentScreen === 'ResetPassword') {
    return (
      <ResetPasswordScreen
        email={resetEmail}
        otp={resetOtp}
        onBack={() => setCurrentScreen('VerificationCode')}
        onReset={() => {
          clearResetFlow();
          setCurrentScreen('Login');
        }}
      />
    );
  }

  if (currentScreen === 'Home') {
    return <ServicesStack onLogout={handleLogout} />;
  }

  return (
    <OnboardingScreen
      onSignIn={() => setCurrentScreen('Login')}
      onSkip={() => setCurrentScreen('Login')}
    />
  );
}

export default AuthStack;

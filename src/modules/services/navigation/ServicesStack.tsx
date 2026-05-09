import React, { useState } from 'react';

import ChatbotStack from '../../chatbot/navigation/ChatbotStack';
import HomeScreen from '../screens/HomeScreen';

export type ServicesScreenName =
  | 'Home'
  | 'HelpAndSupport';

type ServicesStackProps = {
  onLogout?: () => void;
};

function ServicesStack({ onLogout }: ServicesStackProps) {
  const [currentScreen, setCurrentScreen] =
    useState<ServicesScreenName>('Home');

  if (currentScreen === 'HelpAndSupport') {
    return <ChatbotStack onClose={() => setCurrentScreen('Home')} />;
  }

  return (
    <HomeScreen
      onGetStarted={() => setCurrentScreen('HelpAndSupport')}
      onLogout={onLogout}
    />
  );
}

export default ServicesStack;

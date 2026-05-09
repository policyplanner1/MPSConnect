import React, { useState } from 'react';

import BundlesStack from '../../bundles/navigation/BundlesStack';
import ASPScreen from '../screens/ASPScreen';
import HelpandSupportScreen from '../screens/HelpandSupportScreen';

export type ChatbotScreenName =
  | 'HelpAndSupport'
  | 'ASP'
  | 'NewHomePack';

type ChatbotStackProps = {
  onClose?: () => void;
};

function ChatbotStack({ onClose }: ChatbotStackProps) {
  const [currentScreen, setCurrentScreen] =
    useState<ChatbotScreenName>('HelpAndSupport');
  const [responseKey, setResponseKey] = useState('application_stuck_in_processing');

  if (currentScreen === 'ASP') {
    return (
      <ASPScreen
        onBack={() => setCurrentScreen('HelpAndSupport')}
        responseKey={responseKey}
      />
    );
  }

  if (currentScreen === 'NewHomePack') {
    return <BundlesStack onClose={() => setCurrentScreen('HelpAndSupport')} />;
  }

  if (currentScreen === 'HelpAndSupport') {
    return (
      <HelpandSupportScreen
        onBack={onClose}
        onCategorySelect={categoryId => {
          if (categoryId === 'marriage' || categoryId === 'house') {
            setCurrentScreen('NewHomePack');
          }
        }}
        onChatWithUs={selectedResponseKey => {
          setResponseKey(selectedResponseKey ?? 'application_stuck_in_processing');
          setCurrentScreen('ASP');
        }}
        onOpenApplicationIssue={selectedResponseKey => {
          setResponseKey(selectedResponseKey ?? 'application_stuck_in_processing');
          setCurrentScreen('ASP');
        }}
      />
    );
  }

  return null;
}

export default ChatbotStack;

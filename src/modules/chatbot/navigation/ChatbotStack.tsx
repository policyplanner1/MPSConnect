import React, { useState } from 'react';

import BundlesStack from '../../bundles/navigation/BundlesStack';
import NewJobPackScreen from '../../bundles/screens/NewJobPackScreen';
import NewMarriedPackScreen from '../../bundles/screens/NewMarriedPackScreen';
import TravelPackScreen from '../../bundles/screens/TravelPackScreen';
import BuyingPropertyPackScreen from '../../bundles/screens/BuyingPropertyPackScreen';
import ASPScreen from '../screens/ASPScreen';
import HelpandSupportScreen from '../screens/HelpandSupportScreen';

export type ChatbotScreenName =
  | 'HelpAndSupport'
  | 'ASP'
  | 'NewHomePack'
  | 'NewJobPack'
  | 'NewMarriedPack'
  | 'TravelPack'
  | 'BuyingPropertyPack';

type ChatbotStackProps = {
  onClose?: () => void;
  onCreateTicket?: () => void;
};

function ChatbotStack({ onClose, onCreateTicket }: ChatbotStackProps) {
  const [currentScreen, setCurrentScreen] =
    useState<ChatbotScreenName>('HelpAndSupport');
  const [responseKey, setResponseKey] = useState('application_stuck_in_processing');

  if (currentScreen === 'ASP') {
    return (
      <ASPScreen
        onBack={() => setCurrentScreen('HelpAndSupport')}
        onCreateTicket={onCreateTicket}
        responseKey={responseKey}
      />
    );
  }

  if (currentScreen === 'NewHomePack') {
    return <BundlesStack onClose={() => setCurrentScreen('HelpAndSupport')} />;
  }

  if (currentScreen === 'NewJobPack') {
    return <NewJobPackScreen onBack={() => setCurrentScreen('HelpAndSupport')} />;
  }

  if (currentScreen === 'NewMarriedPack') {
    return <NewMarriedPackScreen onBack={() => setCurrentScreen('HelpAndSupport')} />;
  }

  if (currentScreen === 'TravelPack') {
    return <TravelPackScreen onBack={() => setCurrentScreen('HelpAndSupport')} />;
  }

  if (currentScreen === 'BuyingPropertyPack') {
    return <BuyingPropertyPackScreen onBack={() => setCurrentScreen('HelpAndSupport')} />;
  }

  if (currentScreen === 'HelpAndSupport') {
    return (
      <HelpandSupportScreen
        onBack={onClose}
        onCreateTicket={onCreateTicket}
        onCategorySelect={categoryId => {
          if (categoryId === 'house') {
            setCurrentScreen('NewHomePack');
          } else if (categoryId === 'marriage') {
            setCurrentScreen('NewMarriedPack');
          } else if (categoryId === 'job') {
            setCurrentScreen('NewJobPack');
          } else if (categoryId === 'travel') {
            setCurrentScreen('TravelPack');
          } else if (categoryId === 'property') {
            setCurrentScreen('BuyingPropertyPack');
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

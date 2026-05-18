import React, { useState } from 'react';

import ChatbotStack from '../../chatbot/navigation/ChatbotStack';
import HealthInsuranceStack from '../../healthInsurance/navigation/HealthInsuranceStack';
import OtherInsuranceStack from '../../otherInsurance/navigation/OtherInsuranceStack';
import NotificationScreen from '../../notifications/screens/NotificationScreen';
import RefereAndEarn from '../../rewards/screens/RefereAndEarn';
import RewardsHistoryScreen from '../../rewards/screens/RewardsHistoryScreen';
import HomeScreen from '../screens/HomeScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import ServiceListScreen from '../screens/ServiceListScreen';
import { Service } from '../types/service.types';

const HEALTH_INSURANCE_ID = 12;

type ScreenState =
  | { name: 'Home' }
  | { name: 'HelpAndSupport' }
  | { name: 'Notifications' }
  | { name: 'RewardHistory' }
  | { name: 'ReferAndEarn' }
  | { name: 'ServiceList'; categoryId: number }
  | { name: 'ServiceDetail'; serviceId: number; fromCategoryId?: number }
  | { name: 'HealthInsurance' }
  | { name: 'OtherInsurance'; serviceId: number; service: Service };

type ServicesStackProps = {
  onLogout?: () => void;
};

function ServicesStack({ onLogout }: ServicesStackProps) {
  const [screen, setScreen] = useState<ScreenState>({ name: 'Home' });

  if (screen.name === 'HelpAndSupport') {
    return <ChatbotStack onClose={() => setScreen({ name: 'Home' })} />;
  }

  if (screen.name === 'Notifications') {
    return <NotificationScreen onBack={() => setScreen({ name: 'Home' })} />;
  }

  if (screen.name === 'RewardHistory') {
    return (
      <RewardsHistoryScreen
        onBack={() => setScreen({ name: 'Home' })}
        onReferNow={() => setScreen({ name: 'ReferAndEarn' })}
      />
    );
  }

  if (screen.name === 'ReferAndEarn') {
    return (
      <RefereAndEarn onBack={() => setScreen({ name: 'RewardHistory' })} />
    );
  }

  if (screen.name === 'HealthInsurance') {
    return (
      <HealthInsuranceStack
        onBack={() => setScreen({ name: 'ServiceList', categoryId: 2 })}
      />
    );
  }

  if (screen.name === 'OtherInsurance') {
    return (
      <OtherInsuranceStack
        onBack={() => setScreen({ name: 'ServiceList', categoryId: 2 })}
        serviceId={screen.serviceId}
        service={screen.service}
      />
    );
  }

  if (screen.name === 'ServiceList') {
    const { categoryId } = screen;
    return (
      <ServiceListScreen
        categoryId={categoryId}
        onBack={() => setScreen({ name: 'Home' })}
        onServicePress={(serviceId, service) => {
          if (categoryId === 2) {
            if (serviceId === HEALTH_INSURANCE_ID) {
              setScreen({ name: 'HealthInsurance' });
            } else {
              setScreen({ name: 'OtherInsurance', serviceId, service });
            }
          } else {
            setScreen({
              name: 'ServiceDetail',
              serviceId,
              fromCategoryId: categoryId,
            });
          }
        }}
      />
    );
  }

  if (screen.name === 'ServiceDetail') {
    return (
      <ServiceDetailScreen
        serviceId={screen.serviceId}
        onBack={() =>
          screen.fromCategoryId
            ? setScreen({ name: 'ServiceList', categoryId: screen.fromCategoryId })
            : setScreen({ name: 'Home' })
        }
      />
    );
  }

  return (
    <HomeScreen
      onGetStarted={() => setScreen({ name: 'HelpAndSupport' })}
      onGovernmentDocuments={() =>
        setScreen({ name: 'ServiceList', categoryId: 3 })
      }
      onInsurancePress={() => setScreen({ name: 'ServiceList', categoryId: 2 })}
      onOpenNotifications={() => setScreen({ name: 'Notifications' })}
      onOpenRewards={() => setScreen({ name: 'RewardHistory' })}
      onServicePress={serviceId =>
        setScreen({ name: 'ServiceDetail', serviceId })
      }
      onLogout={onLogout}
    />
  );
}

export default ServicesStack;

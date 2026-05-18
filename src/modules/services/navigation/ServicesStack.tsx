import React, { useState } from 'react';

import ChatbotStack from '../../chatbot/navigation/ChatbotStack';
import HealthInsuranceStack from '../../healthInsurance/navigation/HealthInsuranceStack';
import OtherInsuranceStack from '../../otherInsurance/navigation/OtherInsuranceStack';
import HomeScreen from '../screens/HomeScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import ServiceListScreen from '../screens/ServiceListScreen';
import { Service } from '../types/service.types';

const HEALTH_INSURANCE_ID = 12;

type ScreenState =
  | { name: 'Home' }
  | { name: 'HelpAndSupport' }
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
            setScreen({ name: 'ServiceDetail', serviceId, fromCategoryId: categoryId });
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
      onServicePress={serviceId => setScreen({ name: 'ServiceDetail', serviceId })}
      onGovernmentDocuments={() => setScreen({ name: 'ServiceList', categoryId: 3 })}
      onInsurancePress={() => setScreen({ name: 'ServiceList', categoryId: 2 })}
      onLogout={onLogout}
    />
  );
}

export default ServicesStack;

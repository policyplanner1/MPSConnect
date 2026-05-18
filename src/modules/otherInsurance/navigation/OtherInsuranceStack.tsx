import React, { useState } from 'react';

import { Service } from '../../services/types/service.types';
import OtherInsuranceEnquiryScreen from '../screens/OtherInsuranceEnquiryScreen';
import OtherInsuranceLandingScreen from '../screens/OtherInsuranceLandingScreen';

type ScreenState = { name: 'Landing' } | { name: 'Enquiry' };

type Props = {
  onBack: () => void;
  serviceId: number;
  service: Service;
};

function OtherInsuranceStack({ onBack, service }: Props) {
  const [screen, setScreen] = useState<ScreenState>({ name: 'Landing' });

  if (screen.name === 'Enquiry') {
    return (
      <OtherInsuranceEnquiryScreen
        service={service}
        onBack={() => setScreen({ name: 'Landing' })}
      />
    );
  }

  return (
    <OtherInsuranceLandingScreen
      service={service}
      onBack={onBack}
      onEnquiry={() => setScreen({ name: 'Enquiry' })}
    />
  );
}

export default OtherInsuranceStack;

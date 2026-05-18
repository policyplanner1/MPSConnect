import React, { useState } from 'react';

import EnquiryScreen from '../screens/EnquiryScreen';
import HealthInsuranceLandingScreen from '../screens/HealthInsuranceLandingScreen';
import QuoteScreen from '../screens/QuoteScreen';

export type EnquiryFormData = {
  includeSelf: boolean;
  includeSpouse: boolean;
  childrenCount: number;
  selfAge: string;
  spouseAge: string;
  childrenAges: string[];
  firstName: string;
  lastName: string;
  mobile: string;
  city: string;
  pincode: string;
  coverAmount: string;
};

type ScreenState =
  | { name: 'Landing' }
  | { name: 'Enquiry' }
  | { name: 'Quote'; formData: EnquiryFormData };

type Props = {
  onBack: () => void;
};

function HealthInsuranceStack({ onBack }: Props) {
  const [screen, setScreen] = useState<ScreenState>({ name: 'Enquiry' });

  if (screen.name === 'Enquiry') {
    return (
      <EnquiryScreen
        onBack={onBack}
        onSubmit={formData => setScreen({ name: 'Quote', formData })}
      />
    );
  }

  if (screen.name === 'Quote') {
    return (
      <QuoteScreen
        formData={screen.formData}
        onBack={() => setScreen({ name: 'Enquiry' })}
      />
    );
  }

  return (
    <HealthInsuranceLandingScreen
      onBack={onBack}
      onEnquiry={() => setScreen({ name: 'Enquiry' })}
      onGetQuote={() => setScreen({ name: 'Enquiry' })}
    />
  );
}

export default HealthInsuranceStack;

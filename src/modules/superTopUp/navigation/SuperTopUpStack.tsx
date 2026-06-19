import React, { useState } from 'react';

import EnquiryScreen from '../screens/EnquiryScreen';
import QuoteScreen from '../screens/QuoteScreen';

export type SuperTopUpFormData = {
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
  | { name: 'Enquiry' }
  | { name: 'Quote'; formData: SuperTopUpFormData };

type Props = {
  onBack: () => void;
};

function SuperTopUpStack({ onBack }: Props) {
  const [screen, setScreen] = useState<ScreenState>({ name: 'Enquiry' });

  if (screen.name === 'Quote') {
    return (
      <QuoteScreen
        formData={screen.formData}
        onBack={() => setScreen({ name: 'Enquiry' })}
      />
    );
  }

  return (
    <EnquiryScreen
      onBack={onBack}
      onSubmit={formData => setScreen({ name: 'Quote', formData })}
    />
  );
}

export default SuperTopUpStack;

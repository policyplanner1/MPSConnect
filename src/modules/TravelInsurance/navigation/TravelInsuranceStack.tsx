import React, { useState } from 'react';

import type { TravelInsurancePlanSummary, TravelInsuranceSession } from '../types/travelInsurance.types';
import TravelInsuranceKycScreen from '../screens/TravelInsuranceKycScreen';
import TravelInsurancePlanScreen from '../screens/TravelInsurancePlanScreen';
import TravelInsuranceVerifyScreen from '../screens/TravelInsuranceVerifyScreen';

type ScreenState =
  | { name: 'Kyc' }
  | { name: 'Verify'; session: TravelInsuranceSession }
  | { name: 'Plan'; session: TravelInsuranceSession; summary: TravelInsurancePlanSummary };

type Props = {
  onBack: () => void;
};

function TravelInsuranceStack({ onBack }: Props) {
  const [screen, setScreen] = useState<ScreenState>({ name: 'Kyc' });

  if (screen.name === 'Plan') {
    return (
      <TravelInsurancePlanScreen
        summary={screen.summary}
        onBack={() => setScreen({ name: 'Verify', session: screen.session })}
      />
    );
  }

  if (screen.name === 'Verify') {
    return (
      <TravelInsuranceVerifyScreen
        session={screen.session}
        onBack={() => setScreen({ name: 'Kyc' })}
        onComplete={summary =>
          setScreen({ name: 'Plan', session: screen.session, summary })
        }
      />
    );
  }

  return (
    <TravelInsuranceKycScreen
      onBack={onBack}
      onVerified={session => setScreen({ name: 'Verify', session })}
    />
  );
}

export default TravelInsuranceStack;

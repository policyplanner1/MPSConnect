import React, { useState } from 'react';

import NewHomePackScreen from '../screens/NewHomePackScreen';

export type BundlesScreenName =
  | 'BundleList'
  | 'NewHomePack';

type BundlesStackProps = {
  onClose?: () => void;
};

function BundlesStack({ onClose }: BundlesStackProps) {
  const [currentScreen, setCurrentScreen] =
    useState<BundlesScreenName>('NewHomePack');

  if (currentScreen === 'NewHomePack') {
    return (
      <NewHomePackScreen
        onBack={onClose}
      />
    );
  }

  return null;
}

export default BundlesStack;

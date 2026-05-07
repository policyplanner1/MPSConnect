import React, { PropsWithChildren } from 'react';

function StoreProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export default StoreProvider;

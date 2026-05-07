import React, { PropsWithChildren } from 'react';
import { StatusBar } from 'react-native';

function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fffaf5" />
      {children}
    </>
  );
}

export default ThemeProvider;

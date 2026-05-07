import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NavigationProvider from './providers/NavigationProvider';
import StoreProvider from './providers/StoreProvider';
import ThemeProvider from './providers/ThemeProvider';

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StoreProvider>
          <NavigationProvider />
        </StoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;

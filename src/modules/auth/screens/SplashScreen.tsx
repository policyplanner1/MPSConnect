import React from 'react';
import { StyleSheet, View } from 'react-native';
import MpscLogo from '../../../assets/images/mpsclogo.svg';
import AuthBackground from '../components/AuthBackground';

function SplashScreen() {
  return (
    <AuthBackground>
      <View style={styles.container}>
        <MpscLogo height={96} width={96} />
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SplashScreen;

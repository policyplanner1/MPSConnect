import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

export const SECURE_GREEN = {
  bg: 'rgba(22, 163, 74, 0.1)',
  border: 'rgba(22, 163, 74, 0.22)',
  text: '#16a34a',
  icon: '#16a34a',
};

function LockIcon() {
  return (
    <Svg height={14} viewBox="0 0 24 24" width={14}>
      <Rect
        fill="none"
        height="10"
        rx="2"
        stroke={SECURE_GREEN.icon}
        strokeWidth="1.8"
        width="14"
        x="5"
        y="11"
      />
      <Path
        d="M8 11V8a4 4 0 018 0v3"
        fill="none"
        stroke={SECURE_GREEN.icon}
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </Svg>
  );
}

function SecureEncryptedBanner() {
  return (
    <View style={styles.banner}>
      <LockIcon />
      <Text style={[styles.text, inter18('medium')]}>Data Encrypted & Secure</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: SECURE_GREEN.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SECURE_GREEN.border,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  text: {
    fontSize: 12,
    color: SECURE_GREEN.text,
  },
});

export default SecureEncryptedBanner;

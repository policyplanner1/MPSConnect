import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

import { inter18 } from '../../../core/theme/typography';

type Props = {
  label: string;
  required?: boolean;
  style?: TextStyle;
  variant?: 'medium' | 'semiBold';
};

export default function FormFieldLabel({
  label,
  required = false,
  style,
  variant = 'medium',
}: Props) {
  return (
    <Text style={[styles.label, inter18(variant), style]}>
      {label}
      {required ? <Text style={styles.requiredMark}> *</Text> : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    color: '#374151',
  },
  requiredMark: {
    color: '#DC2626',
  },
});

import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { formatInr, parseAmount } from '../utils/formatter';
import { inter18 } from '../../../core/theme/typography';

type PlannerCurrencyInputProps = {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
};

function PlannerCurrencyInput({
  label,
  required,
  value,
  onChangeText,
  placeholder = '0',
}: PlannerCurrencyInputProps) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, inter18('medium')]}>
        {label}
        {required ? <Text style={styles.asterisk}> *</Text> : null}
      </Text>
      <View style={styles.inputRow}>
        <Text style={[styles.prefix, inter18('semiBold')]}>₹</Text>
        <TextInput
          keyboardType="number-pad"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          style={[styles.input, inter18('regular')]}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}

export function formatCurrencyDisplay(raw: string): string {
  const n = parseAmount(raw);
  if (n <= 0 && !raw.trim()) {
    return '';
  }
  return n > 0 ? formatInr(n) : raw;
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#374151',
  },
  asterisk: {
    color: '#DC2626',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    minHeight: 48,
  },
  prefix: {
    fontSize: 16,
    color: '#111111',
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
    paddingVertical: 10,
  },
});

export default PlannerCurrencyInput;

import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { inter18 } from '../../../core/theme/typography';

type GoalInputFieldProps = {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  prefix?: string;
  suffix?: string;
  keyboardType?: TextInputProps['keyboardType'];
  editable?: boolean;
};

export default function GoalInputField({
  label,
  hint,
  value,
  onChangeText,
  onBlur,
  prefix,
  suffix,
  keyboardType = 'default',
  editable = true,
}: GoalInputFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, inter18('medium')]}>{label}</Text>
      {hint ? <Text style={[styles.hint, inter18('regular')]}>{hint}</Text> : null}
      <View style={styles.inputRow}>
        {prefix ? <Text style={[styles.affix, inter18('semiBold')]}>{prefix}</Text> : null}
        <TextInput
          editable={editable}
          keyboardType={keyboardType}
          placeholderTextColor="#9CA3AF"
          style={[styles.input, inter18('regular'), !editable && styles.inputDisabled]}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
        />
        {suffix ? <Text style={[styles.affix, inter18('semiBold')]}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: '#374151',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    minHeight: 48,
  },
  affix: {
    fontSize: 15,
    color: '#6B7280',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 10,
  },
  inputDisabled: {
    color: '#9CA3AF',
  },
});

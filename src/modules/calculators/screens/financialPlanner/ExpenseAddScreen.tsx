import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalculatorHeader from '../../components/CalculatorHeader';
import { EXPENSE_CATEGORIES } from '../../constants/expenseCategories';
import type { ExpenseEntry } from '../../types/financialPlanner';
import { createPlannerId } from '../../utils/financialPlannerEngine';
import { parseAmount } from '../../utils/formatter';
import { inter18 } from '../../../../core/theme/typography';

type ExpenseAddScreenProps = {
  defaultDate: string;
  onBack: () => void;
  onSave: (entry: ExpenseEntry) => void;
};

function ExpenseAddScreen({ defaultDate, onBack, onSave }: ExpenseAddScreenProps) {
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState(EXPENSE_CATEGORIES[0].id);
  const [date, setDate] = useState(defaultDate);

  const handleSave = () => {
    const amount = parseAmount(amountStr);
    if (amount <= 0) {
      Alert.alert('Amount required', 'Enter a valid expense amount.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('Invalid date', 'Use YYYY-MM-DD format.');
      return;
    }
    onSave({
      id: createPlannerId(),
      amount,
      categoryId,
      note:
        note.trim() ||
        (EXPENSE_CATEGORIES.find(c => c.id === categoryId)?.label ?? 'Expense'),
      date,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="Add expense" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.label, inter18('medium')]}>Amount *</Text>
          <View style={styles.inputRow}>
            <Text style={[styles.prefix, inter18('semiBold')]}>₹</Text>
            <TextInput
              keyboardType="number-pad"
              placeholder="e.g. 500"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, inter18('regular')]}
              value={amountStr}
              onChangeText={setAmountStr}
            />
          </View>

          <Text style={[styles.label, inter18('medium')]}>Date (YYYY-MM-DD)</Text>
          <TextInput
            placeholder="2026-05-25"
            placeholderTextColor="#9CA3AF"
            style={[styles.dateInput, inter18('regular')]}
            value={date}
            onChangeText={setDate}
          />

          <Text style={[styles.label, inter18('medium')]}>Note</Text>
          <TextInput
            placeholder="What was this for?"
            placeholderTextColor="#9CA3AF"
            style={[styles.dateInput, inter18('regular')]}
            value={note}
            onChangeText={setNote}
          />

          <Text style={[styles.label, inter18('medium')]}>Category</Text>
          <View style={styles.chips}>
            {EXPENSE_CATEGORIES.map(cat => (
              <Pressable
                key={cat.id}
                onPress={() => setCategoryId(cat.id)}
                style={[
                  styles.chip,
                  categoryId === cat.id && {
                    backgroundColor: cat.iconBg,
                    borderColor: cat.iconColor,
                  },
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    inter18(categoryId === cat.id ? 'semiBold' : 'regular'),
                    categoryId === cat.id && { color: cat.iconColor },
                  ]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}>
            <Text style={[styles.primaryBtnText, inter18('bold')]}>Save expense</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scroll: { padding: 16, gap: 10, paddingBottom: 24 },
  label: { fontSize: 14, color: '#374151', marginTop: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  prefix: { fontSize: 16, marginRight: 6 },
  input: { flex: 1, fontSize: 16, color: '#111111', paddingVertical: 10 },
  dateInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111111',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  chipText: { fontSize: 12, color: '#4B5563' },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnPressed: { opacity: 0.9 },
  primaryBtnText: { fontSize: 16, color: '#FFFFFF' },
});

export default ExpenseAddScreen;

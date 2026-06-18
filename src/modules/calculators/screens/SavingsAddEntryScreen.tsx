import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalculatorHeader from '../components/CalculatorHeader';
import { SAVINGS_CATEGORIES } from '../constants/savingsCategories';
import type { SavingsEntry, SavingsRecurrence } from '../types/savings';
import { createSavingsId } from '../utils/savingsEngine';
import { formatInr, parseAmount } from '../utils/formatter';
import { inter18 } from '../../../core/theme/typography';

const GREEN = '#0F6E56';
const GREEN_BG = '#E1F5EE';

const RECURRENCE_OPTIONS: { id: SavingsRecurrence; label: string }[] = [
  { id: 'oneTime', label: 'One-time' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

type SavingsAddEntryScreenProps = {
  onBack: () => void;
  onSave: (entry: SavingsEntry) => void;
};

function monthOptions(): { label: string; value: number }[] {
  return Array.from({ length: 12 }, (_, i) => ({
    label: new Date(2000, i, 1).toLocaleDateString('en-IN', { month: 'long' }),
    value: i + 1,
  }));
}

function yearOptions(): { label: string; value: number }[] {
  const y = new Date().getFullYear();
  const opts: { label: string; value: number }[] = [];
  for (let i = y - 2; i <= y + 3; i += 1) {
    opts.push({ label: String(i), value: i });
  }
  return opts;
}

const MONTH_OPTS = monthOptions();
const YEAR_OPTS = yearOptions();

function SavingsAddEntryScreen({ onBack, onSave }: SavingsAddEntryScreenProps) {
  const now = new Date();
  const [categoryId, setCategoryId] = useState(SAVINGS_CATEGORIES[0].id);
  const [itemName, setItemName] = useState('');
  const [oldStr, setOldStr] = useState('');
  const [newStr, setNewStr] = useState('');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [recurrence, setRecurrence] = useState<SavingsRecurrence>('oneTime');
  const [recModal, setRecModal] = useState(false);
  const [monthModal, setMonthModal] = useState(false);
  const [yearModal, setYearModal] = useState(false);

  const oldCost = parseAmount(oldStr);
  const newCost = parseAmount(newStr);
  const youSave = Math.max(0, oldCost - newCost);
  const pct =
    oldCost > 0 ? Math.round(((oldCost - newCost) / oldCost) * 1000) / 10 : 0;

  const handleSave = () => {
    const title = itemName.trim();
    if (!title) {
      Alert.alert('Item name required', 'Please enter what you saved on.');
      return;
    }
    if (oldCost <= 0 && newCost <= 0) {
      Alert.alert('Amounts required', 'Enter at least old or new cost.');
      return;
    }
    const entry: SavingsEntry = {
      id: createSavingsId(),
      categoryId,
      itemName: title,
      oldCost,
      newCost,
      month,
      year,
      recurrence,
      createdAt: new Date().toISOString(),
    };
    onSave(entry);
    onBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="New entry" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={88}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={[styles.lbl, inter18('medium')]}>Category</Text>
            <View style={styles.tagRow}>
              {SAVINGS_CATEGORIES.map(c => {
                const sel = categoryId === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategoryId(c.id)}
                    style={[styles.tag, sel && styles.tagSel]}>
                    <Text
                      style={[
                        styles.tagText,
                        inter18(sel ? 'semiBold' : 'regular'),
                        sel && styles.tagTextSel,
                      ]}>
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={[styles.lbl, inter18('medium')]}>Item name</Text>
            <TextInput
              placeholder="e.g. Monthly grocery bill"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, inter18('regular')]}
              value={itemName}
              onChangeText={setItemName}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.card, styles.half]}>
              <Text style={[styles.lbl, inter18('medium')]}>Old cost</Text>
              <View style={styles.inputRow}>
                <Text style={[styles.rupee, inter18('semiBold')]}>₹</Text>
                <TextInput
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.inputFlex, inter18('regular')]}
                  value={oldStr}
                  onChangeText={t => setOldStr(t.replace(/[^0-9]/g, ''))}
                />
              </View>
            </View>
            <View style={[styles.card, styles.half]}>
              <Text style={[styles.lbl, inter18('medium')]}>New cost</Text>
              <View style={styles.inputRow}>
                <Text style={[styles.rupee, inter18('semiBold')]}>₹</Text>
                <TextInput
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.inputFlex, inter18('regular')]}
                  value={newStr}
                  onChangeText={t => setNewStr(t.replace(/[^0-9]/g, ''))}
                />
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.card, styles.half]}>
              <Text style={[styles.lbl, inter18('medium')]}>Month</Text>
              <Pressable onPress={() => setMonthModal(true)} style={styles.pickerBtn}>
                <Text style={[styles.pickerText, inter18('regular')]}>
                  {MONTH_OPTS.find(m => m.value === month)?.label}
                </Text>
                <Text style={styles.chev}>▾</Text>
              </Pressable>
            </View>
            <View style={[styles.card, styles.half]}>
              <Text style={[styles.lbl, inter18('medium')]}>Year</Text>
              <Pressable onPress={() => setYearModal(true)} style={styles.pickerBtn}>
                <Text style={[styles.pickerText, inter18('regular')]}>{year}</Text>
                <Text style={styles.chev}>▾</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={[styles.lbl, inter18('medium')]}>Recurrence</Text>
            <Pressable onPress={() => setRecModal(true)} style={styles.pickerBtn}>
              <Text style={[styles.pickerText, inter18('regular')]}>
                {RECURRENCE_OPTIONS.find(r => r.id === recurrence)?.label}
              </Text>
              <Text style={styles.chev}>▾</Text>
            </Pressable>
          </View>

          <View style={styles.preview}>
            <Text style={[styles.previewLbl, inter18('regular')]}>You save</Text>
            <View style={styles.previewRight}>
              <Text style={[styles.previewAmt, inter18('semiBold')]}>
                ₹ {formatInr(youSave)}
              </Text>
              {oldCost > 0 ? (
                <Text style={[styles.previewPct, inter18('medium')]}>
                  {pct >= 0 ? `${pct}%` : ''} vs old spend
                </Text>
              ) : null}
            </View>
          </View>

          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.saveBtn, pressed && styles.savePressed]}>
            <Text style={[styles.saveText, inter18('semiBold')]}>Save entry</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerModal
        open={recModal}
        options={RECURRENCE_OPTIONS.map(r => ({ label: r.label, value: r.id }))}
        title="Recurrence"
        value={recurrence}
        onClose={() => setRecModal(false)}
        onSelect={v => {
          setRecurrence(v as SavingsRecurrence);
          setRecModal(false);
        }}
      />
      <PickerModal
        open={monthModal}
        options={MONTH_OPTS.map(m => ({ label: m.label, value: String(m.value) }))}
        title="Month"
        value={String(month)}
        onClose={() => setMonthModal(false)}
        onSelect={v => {
          setMonth(parseInt(v, 10));
          setMonthModal(false);
        }}
      />
      <PickerModal
        open={yearModal}
        options={YEAR_OPTS.map(y => ({ label: y.label, value: String(y.value) }))}
        title="Year"
        value={String(year)}
        onClose={() => setYearModal(false)}
        onSelect={v => {
          setYear(parseInt(v, 10));
          setYearModal(false);
        }}
      />
    </SafeAreaView>
  );
}

function PickerModal({
  open,
  title,
  options,
  value,
  onClose,
  onSelect,
}: {
  open: boolean;
  title: string;
  options: { label: string; value: string }[];
  value: string;
  onClose: () => void;
  onSelect: (v: string) => void;
}) {
  return (
    <Modal animationType="slide" transparent visible={open} onRequestClose={onClose}>
      <Pressable style={styles.modalBg} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
          <Text style={[styles.modalTitle, inter18('semiBold')]}>{title}</Text>
          <ScrollView style={styles.modalList}>
            {options.map(opt => (
              <Pressable
                key={opt.value}
                onPress={() => onSelect(opt.value)}
                style={[styles.modalRow, value === opt.value && styles.modalRowOn]}>
                <Text
                  style={[
                    styles.modalRowText,
                    inter18(value === opt.value ? 'semiBold' : 'regular'),
                  ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable onPress={onClose} style={styles.modalCancel}>
            <Text style={[styles.modalCancelText, inter18('medium')]}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F7' },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  lbl: { fontSize: 12, color: '#6B7280' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    backgroundColor: '#FAFAFA',
  },
  tagSel: { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' },
  tagText: { fontSize: 11, color: '#6B7280' },
  tagTextSel: { color: '#2563EB' },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    color: '#111111',
    minHeight: 44,
  },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 10,
    minHeight: 44,
  },
  rupee: { fontSize: 15, color: '#6B7280', marginRight: 4 },
  inputFlex: { flex: 1, fontSize: 15, color: '#111111', paddingVertical: 10 },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    minHeight: 44,
  },
  pickerText: { fontSize: 14, color: '#111111' },
  chev: { color: '#9CA3AF', fontSize: 12 },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  previewLbl: { fontSize: 13, color: '#6B7280' },
  previewRight: { alignItems: 'flex-end' },
  previewAmt: { fontSize: 18, color: GREEN },
  previewPct: { fontSize: 11, color: GREEN, marginTop: 2 },
  saveBtn: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  savePressed: { opacity: 0.9 },
  saveText: { fontSize: 15, color: '#FFFFFF' },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '55%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  modalTitle: {
    textAlign: 'center',
    paddingVertical: 14,
    fontSize: 16,
    color: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalList: { maxHeight: 280 },
  modalRow: { paddingVertical: 14, paddingHorizontal: 20 },
  modalRowOn: { backgroundColor: GREEN_BG },
  modalRowText: { fontSize: 15, color: '#111111' },
  modalCancel: { paddingVertical: 14, alignItems: 'center' },
  modalCancelText: { fontSize: 15, color: '#6B7280' },
});

export default SavingsAddEntryScreen;

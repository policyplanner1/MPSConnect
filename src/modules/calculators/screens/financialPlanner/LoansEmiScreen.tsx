import React, { useState } from 'react';
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

import CalculatorHeader from '../../components/CalculatorHeader';
import { LOAN_TYPES, type LoanType } from '../../constants/loanTypes';
import type { LoanEntry } from '../../types/financialPlanner';
import { createPlannerId, totalLoanEmi } from '../../utils/financialPlannerEngine';
import { formatInr, parseAmount } from '../../utils/formatter';
import { inter18 } from '../../../../core/theme/typography';

type LoansEmiScreenProps = {
  loans: LoanEntry[];
  onBack: () => void;
  onOpenEmiCalculator: () => void;
  onSaveLoans: (loans: LoanEntry[]) => void;
};

function PickerModal({
  open,
  title,
  options,
  selectedValue,
  onClose,
  onSelect,
}: {
  open: boolean;
  title: string;
  options: readonly string[];
  selectedValue: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <Modal animationType="slide" transparent visible={open} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
          <Text style={[styles.modalTitle, inter18('semiBold')]}>{title}</Text>
          <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
            {options.map(opt => (
              <Pressable
                key={opt}
                onPress={() => onSelect(opt)}
                style={[styles.modalOption, selectedValue === opt && styles.modalOptionActive]}>
                <Text
                  style={[
                    styles.modalOptionText,
                    inter18(selectedValue === opt ? 'semiBold' : 'regular'),
                  ]}>
                  {opt}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function LoansEmiScreen({ loans, onBack, onOpenEmiCalculator, onSaveLoans }: LoansEmiScreenProps) {
  const [loanType, setLoanType] = useState<LoanType>(LOAN_TYPES[0]);
  const [loanPickerOpen, setLoanPickerOpen] = useState(false);
  const [emiStr, setEmiStr] = useState('');
  const [localLoans, setLocalLoans] = useState(loans);

  const totalEmi = totalLoanEmi(localLoans);

  const addLoan = () => {
    const emi = parseAmount(emiStr);
    if (emi <= 0) {
      Alert.alert('EMI required', 'Enter the monthly EMI amount.');
      return;
    }
    const next = [
      ...localLoans,
      {
        id: createPlannerId(),
        name: loanType,
        emiAmount: emi,
        createdAt: new Date().toISOString(),
      },
    ];
    setLocalLoans(next);
    onSaveLoans(next);
    setEmiStr('');
  };

  const removeLoan = (id: string) => {
    const next = localLoans.filter(l => l.id !== id);
    setLocalLoans(next);
    onSaveLoans(next);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="Loans & EMI" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.heading, inter18('bold')]}>Loans & EMI</Text>
          <Text style={[styles.sub, inter18('regular')]}>
            Add each loan's monthly EMI. Use the EMI calculator for new loans.
          </Text>

          <Pressable
            onPress={onOpenEmiCalculator}
            style={({ pressed }) => [styles.calcLink, pressed && { opacity: 0.85 }]}>
            <Text style={[styles.calcLinkText, inter18('semiBold')]}>Open EMI Calculator →</Text>
          </Pressable>

          <Text style={[styles.label, inter18('medium')]}>Loan name</Text>
          <Pressable onPress={() => setLoanPickerOpen(true)} style={styles.pickerBtn}>
            <Text style={[styles.pickerText, inter18('regular')]}>{loanType}</Text>
            <Text style={styles.chevron}>▾</Text>
          </Pressable>

          <Text style={[styles.label, inter18('medium')]}>Monthly EMI (₹)</Text>
          <View style={styles.inputRow}>
            <Text style={[styles.prefix, inter18('semiBold')]}>₹</Text>
            <TextInput
              keyboardType="number-pad"
              placeholder="8,000"
              placeholderTextColor="#9CA3AF"
              style={[styles.inputInner, inter18('regular')]}
              value={emiStr}
              onChangeText={setEmiStr}
            />
          </View>

          <Pressable
            onPress={addLoan}
            style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}>
            <Text style={[styles.addBtnText, inter18('semiBold')]}>Add loan</Text>
          </Pressable>

          {localLoans.length > 0 ? (
            <View style={styles.list}>
              {localLoans.map(loan => (
                <Pressable
                  key={loan.id}
                  onLongPress={() => removeLoan(loan.id)}
                  style={styles.loanRow}>
                  <View style={styles.loanBody}>
                    <Text style={[styles.loanName, inter18('medium')]}>{loan.name}</Text>
                    <Text style={[styles.loanHint, inter18('regular')]}>Long-press to remove</Text>
                  </View>
                  <Text style={[styles.loanEmi, inter18('bold')]}>₹ {formatInr(loan.emiAmount)}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <View style={styles.totalBox}>
            <Text style={[styles.totalLabel, inter18('semiBold')]}>Total Monthly EMI</Text>
            <Text style={[styles.totalValue, inter18('bold')]}>₹ {formatInr(totalEmi)}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerModal
        open={loanPickerOpen}
        title="Select loan type"
        options={LOAN_TYPES}
        selectedValue={loanType}
        onClose={() => setLoanPickerOpen(false)}
        onSelect={v => {
          setLoanType(v as LoanType);
          setLoanPickerOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scroll: { padding: 16, gap: 10, paddingBottom: 24 },
  heading: { fontSize: 22, color: '#111111' },
  sub: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 6 },
  calcLink: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginBottom: 8,
  },
  calcLinkText: { fontSize: 14, color: '#2563EB' },
  label: { fontSize: 14, color: '#374151', marginTop: 6 },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
    backgroundColor: '#FAFAFA',
  },
  pickerText: { fontSize: 16, color: '#111111', flex: 1 },
  chevron: { fontSize: 14, color: '#9CA3AF', marginLeft: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  prefix: { marginRight: 6, fontSize: 16 },
  inputInner: { flex: 1, fontSize: 16, color: '#111111', paddingVertical: 10 },
  addBtn: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 280,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  addBtnPressed: { opacity: 0.9 },
  addBtnText: { fontSize: 15, color: '#FFFFFF' },
  list: {
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  loanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
  },
  loanBody: { flex: 1, gap: 2 },
  loanName: { fontSize: 14, color: '#111111' },
  loanHint: { fontSize: 11, color: '#9CA3AF' },
  loanEmi: { fontSize: 15, color: '#EA580C' },
  totalBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    padding: 16,
    gap: 6,
    marginTop: 12,
  },
  totalLabel: { fontSize: 14, color: '#C2410C' },
  totalValue: { fontSize: 24, color: '#111111' },
  modalOverlay: {
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
  modalList: { maxHeight: 320 },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionActive: { backgroundColor: '#EFF6FF' },
  modalOptionText: { fontSize: 15, color: '#111111' },
});

export default LoansEmiScreen;

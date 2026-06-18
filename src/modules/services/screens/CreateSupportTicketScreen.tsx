import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

import AppScreenHeader from '../../../components/AppScreenHeader';
import {
  getCrmEnquiryUserId,
  getCrmUserIdLinkErrorMessage,
} from '../../../core/utils/crmUserSession';
import { inter18 } from '../../../core/theme/typography';
import { ensureMpsOAuthToken } from '../../../services/mpsOAuth.service';
import {
  createSupportTicket,
  fetchSupportCategories,
  getSupportTicketErrorMessage,
} from '../api/supportTicketApi';
import SupportModeTabs from '../components/SupportModeTabs';
import type { SupportCategory } from '../types/support.types';

type CreateSupportTicketScreenProps = {
  onBack: () => void;
  onOpenChat?: () => void;
};

function CategoryPickerModal({
  open,
  categories,
  selectedId,
  onClose,
  onSelect,
}: {
  open: boolean;
  categories: SupportCategory[];
  selectedId: number | null;
  onClose: () => void;
  onSelect: (category: SupportCategory) => void;
}) {
  return (
    <Modal animationType="slide" transparent visible={open} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
          <Text style={[styles.modalTitle, inter18('semiBold')]}>Select category</Text>
          <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
            {categories.map(cat => (
              <Pressable
                key={cat.category_id}
                onPress={() => onSelect(cat)}
                style={[
                  styles.modalOption,
                  selectedId === cat.category_id && styles.modalOptionActive,
                ]}>
                <Text
                  style={[
                    styles.modalOptionText,
                    inter18(selectedId === cat.category_id ? 'semiBold' : 'regular'),
                  ]}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CreateSupportTicketScreen({ onBack, onOpenChat }: CreateSupportTicketScreenProps) {
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<SupportCategory | null>(null);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const res = await fetchSupportCategories();
      setCategories(res.data);
      if (res.data.length > 0) {
        setSelectedCategory(prev => prev ?? res.data[0]);
      }
    } catch (e) {
      setCategoriesError(getSupportTicketErrorMessage(e));
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    void ensureMpsOAuthToken().catch(() => {
      // Submit will surface a clear error if MPS OAuth is missing
    });
  }, [loadCategories]);

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Category required', 'Please select a support category.');
      return;
    }
    const subjectTrim = subject.trim();
    if (!subjectTrim) {
      Alert.alert('Subject required', 'Please enter a subject for your ticket.');
      return;
    }
    const descriptionTrim = description.trim();
    if (!descriptionTrim) {
      Alert.alert('Description required', 'Please describe your issue.');
      return;
    }

    const userId = await getCrmEnquiryUserId();
    if (userId == null) {
      Alert.alert('Account', getCrmUserIdLinkErrorMessage());
      return;
    }

    setSubmitting(true);
    try {
      const res = await createSupportTicket({
        user_id: userId,
        subject: subjectTrim,
        description: descriptionTrim,
        category_id: selectedCategory.category_id,
      });
      Alert.alert(
        'Ticket created',
        res.message || `Your ticket #${res.ticket_id} was submitted successfully.`,
        [{ text: 'OK', onPress: onBack }],
      );
    } catch (e) {
      Alert.alert('Could not submit', getSupportTicketErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <AppScreenHeader variant="title" title="Create ticket" onBack={onBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.heading, inter18('bold')]}>Need support?</Text>
          <Text style={[styles.sub, inter18('regular')]}>
            Tell us your issue and our team will get back to you.
          </Text>

          <Text style={[styles.label, inter18('medium')]}>Category</Text>
          {categoriesLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#2563EB" />
              <Text style={[styles.loadingText, inter18('regular')]}>Loading categories…</Text>
            </View>
          ) : categoriesError ? (
            <View style={styles.errorBox}>
              <Text style={[styles.errorText, inter18('regular')]}>{categoriesError}</Text>
              <Pressable onPress={loadCategories} style={styles.retryBtn}>
                <Text style={[styles.retryText, inter18('semiBold')]}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setCategoryPickerOpen(true)}
              style={styles.pickerBtn}
              disabled={categories.length === 0}>
              <Text
                style={[
                  styles.pickerText,
                  inter18('regular'),
                  !selectedCategory && styles.pickerPlaceholder,
                ]}>
                {selectedCategory?.name ?? 'Select category'}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </Pressable>
          )}

          <Text style={[styles.label, inter18('medium')]}>Subject</Text>
          <TextInput
            placeholder="Brief summary of your issue"
            placeholderTextColor="#9CA3AF"
            style={[styles.input, inter18('regular')]}
            value={subject}
            onChangeText={setSubject}
            maxLength={120}
          />

          <Text style={[styles.label, inter18('medium')]}>Description</Text>
          <TextInput
            multiline
            placeholder="Describe your issue in detail"
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.inputMultiline, inter18('regular')]}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />

          <Pressable
            onPress={handleSubmit}
            disabled={submitting || categoriesLoading || !!categoriesError}
            style={({ pressed }) => [
              styles.submitBtn,
              (pressed || submitting) && styles.submitBtnPressed,
              (categoriesLoading || categoriesError) && styles.submitBtnDisabled,
            ]}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.submitText, inter18('semiBold')]}>Submit ticket</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <CategoryPickerModal
        open={categoryPickerOpen}
        categories={categories}
        selectedId={selectedCategory?.category_id ?? null}
        onClose={() => setCategoryPickerOpen(false)}
        onSelect={cat => {
          setSelectedCategory(cat);
          setCategoryPickerOpen(false);
        }}
      />

      {onOpenChat ? (
        <SupportModeTabs active="ticket" onChat={onOpenChat} onTicket={() => {}} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32, gap: 8 },
  heading: { fontSize: 22, color: '#111111', marginBottom: 4 },
  sub: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 12 },
  label: { fontSize: 14, color: '#374151', marginTop: 8 },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    minHeight: 48,
    paddingVertical: 10,
  },
  pickerText: { fontSize: 15, color: '#111111', flex: 1 },
  pickerPlaceholder: { color: '#9CA3AF' },
  chevron: { fontSize: 14, color: '#9CA3AF', marginLeft: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    color: '#111111',
    minHeight: 48,
  },
  inputMultiline: { minHeight: 120, paddingTop: 12 },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  loadingText: { fontSize: 14, color: '#6B7280' },
  errorBox: {
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  errorText: { fontSize: 13, color: '#B91C1C' },
  retryBtn: { alignSelf: 'flex-start' },
  retryText: { fontSize: 14, color: '#2563EB' },
  submitBtn: {
    marginTop: 16,
    backgroundColor: '#111111',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnPressed: { opacity: 0.9 },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontSize: 15, color: '#FFFFFF' },
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

export default CreateSupportTicketScreen;

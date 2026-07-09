import React, { useEffect, useMemo, useState } from 'react';
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

import { inter18 } from '../../../core/theme/typography';
import type { ServiceAddress, ServiceAddressInput, ServiceAddressLabel } from '../types/serviceAddress.types';
import { formatServiceAddressLine } from '../utils/serviceAddress';

type PickerMode = 'list' | 'form';

type ServiceAddressPickerModalProps = {
  visible: boolean;
  addresses: ServiceAddress[];
  selectedAddressId: number | null;
  loading?: boolean;
  saving?: boolean;
  profileName?: string;
  profilePhone?: string;
  onClose: () => void;
  onSelectAddress: (addressId: number) => void;
  onSaveAddress: (input: ServiceAddressInput, addressId?: number) => Promise<void>;
  onDeleteAddress?: (addressId: number) => Promise<void>;
  startInAddMode?: boolean;
};

const LABEL_OPTIONS: ServiceAddressLabel[] = ['Home', 'Work', 'Other'];

function emptyForm(profileName?: string, profilePhone?: string): ServiceAddressInput {
  return {
    label: 'Home',
    fullName: profileName?.trim() ?? '',
    phone: profilePhone?.replace(/\D/g, '').slice(-10) ?? '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true,
  };
}

function toForm(address: ServiceAddress): ServiceAddressInput {
  return {
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? '',
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    isDefault: address.isDefault,
  };
}

function validateForm(form: ServiceAddressInput): string | null {
  if (!form.fullName.trim()) {
    return 'Full name is required';
  }
  if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
    return 'Enter a valid 10-digit mobile number';
  }
  if (!form.addressLine1.trim()) {
    return 'Address line is required';
  }
  if (!form.city.trim()) {
    return 'City is required';
  }
  if (!form.state.trim()) {
    return 'State is required';
  }
  if (!/^\d{6}$/.test(form.pincode.trim())) {
    return 'Enter a valid 6-digit pincode';
  }
  return null;
}

export default function ServiceAddressPickerModal({
  visible,
  addresses,
  selectedAddressId,
  loading = false,
  saving = false,
  profileName,
  profilePhone,
  onClose,
  onSelectAddress,
  onSaveAddress,
  onDeleteAddress,
  startInAddMode = false,
}: ServiceAddressPickerModalProps) {
  const [mode, setMode] = useState<PickerMode>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ServiceAddressInput>(emptyForm(profileName, profilePhone));
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (startInAddMode || addresses.length === 0) {
      setMode('form');
      setEditingId(null);
      setForm(emptyForm(profileName, profilePhone));
      setFormError(null);
      return;
    }
    setMode('list');
    setEditingId(null);
    setFormError(null);
  }, [visible, startInAddMode, addresses.length, profileName, profilePhone]);

  const title = useMemo(() => {
    if (mode === 'form') {
      return editingId ? 'Update address' : 'Add address';
    }
    return 'Select delivery address';
  }, [editingId, mode]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm(profileName, profilePhone));
    setFormError(null);
    setMode('form');
  };

  const openEditForm = (address: ServiceAddress) => {
    setEditingId(address.id);
    setForm(toForm(address));
    setFormError(null);
    setMode('form');
  };

  const handleSave = async () => {
    const validationError = validateForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      await onSaveAddress(
        {
          ...form,
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2?.trim() || '',
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          isDefault: editingId ? form.isDefault : addresses.length === 0 || form.isDefault,
        },
        editingId ?? undefined,
      );
      onClose();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save address');
    }
  };

  const handleDelete = () => {
    if (!editingId || !onDeleteAddress) {
      return;
    }

    Alert.alert('Delete address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await onDeleteAddress(editingId);
              onClose();
            } catch (error) {
              Alert.alert(
                'Delete address',
                error instanceof Error ? error.message : 'Failed to delete address',
              );
            }
          })();
        },
      },
    ]);
  };

  const updateField = <K extends keyof ServiceAddressInput>(key: K, value: ServiceAddressInput[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setFormError(null);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            {mode === 'form' && addresses.length > 0 ? (
              <Pressable onPress={() => setMode('list')} hitSlop={8}>
                <Text style={[styles.backText, inter18('semiBold')]}>Back</Text>
              </Pressable>
            ) : (
              <View style={styles.headerSpacer} />
            )}
            <Text style={[styles.headerTitle, inter18('bold')]}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={[styles.closeText, inter18('semiBold')]}>Close</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#5E02AF" />
            </View>
          ) : mode === 'list' ? (
            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
              {addresses.map(address => {
                const selected = address.id === selectedAddressId;
                return (
                  <Pressable
                    key={address.id}
                    onPress={() => {
                      onSelectAddress(address.id);
                      onClose();
                    }}
                    style={[styles.addressCard, selected && styles.addressCardSelected]}>
                    <View style={styles.addressCardTop}>
                      <View style={styles.labelPill}>
                        <Text style={[styles.labelPillText, inter18('semiBold')]}>{address.label}</Text>
                      </View>
                      {address.isDefault ? (
                        <Text style={[styles.defaultBadge, inter18('medium')]}>Default</Text>
                      ) : null}
                    </View>
                    <Text style={[styles.cardName, inter18('bold')]}>{address.fullName}</Text>
                    <Text style={[styles.cardPhone, inter18('regular')]}>{address.phone}</Text>
                    <Text style={[styles.cardLine, inter18('regular')]}>{formatServiceAddressLine(address)}</Text>
                    <Pressable
                      onPress={() => openEditForm(address)}
                      hitSlop={8}
                      style={styles.editBtn}>
                      <Text style={[styles.editBtnText, inter18('semiBold')]}>Edit</Text>
                    </Pressable>
                  </Pressable>
                );
              })}

              <Pressable style={styles.addNewBtn} onPress={openAddForm}>
                <Text style={[styles.addNewBtnText, inter18('bold')]}>+ Add new address</Text>
              </Pressable>
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
              <Text style={[styles.fieldLabel, inter18('semiBold')]}>Save address as</Text>
              <View style={styles.labelRow}>
                {LABEL_OPTIONS.map(option => {
                  const active = form.label === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => updateField('label', option)}
                      style={[styles.labelChip, active && styles.labelChipActive]}>
                      <Text
                        style={[
                          styles.labelChipText,
                          inter18('semiBold'),
                          active && styles.labelChipTextActive,
                        ]}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.fieldLabel, inter18('semiBold')]}>Full name</Text>
              <TextInput
                value={form.fullName}
                onChangeText={value => updateField('fullName', value)}
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={[styles.fieldLabel, inter18('semiBold')]}>Mobile number</Text>
              <TextInput
                value={form.phone}
                onChangeText={value => updateField('phone', value.replace(/\D/g, '').slice(0, 10))}
                style={styles.input}
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={[styles.fieldLabel, inter18('semiBold')]}>House no., building, street</Text>
              <TextInput
                value={form.addressLine1}
                onChangeText={value => updateField('addressLine1', value)}
                style={styles.input}
                placeholder="Flat, house no., building, street"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={[styles.fieldLabel, inter18('semiBold')]}>Area, landmark (optional)</Text>
              <TextInput
                value={form.addressLine2}
                onChangeText={value => updateField('addressLine2', value)}
                style={styles.input}
                placeholder="Area, sector, landmark"
                placeholderTextColor="#9CA3AF"
              />

              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <Text style={[styles.fieldLabel, inter18('semiBold')]}>City</Text>
                  <TextInput
                    value={form.city}
                    onChangeText={value => updateField('city', value)}
                    style={styles.input}
                    placeholder="City"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.rowItem}>
                  <Text style={[styles.fieldLabel, inter18('semiBold')]}>Pincode</Text>
                  <TextInput
                    value={form.pincode}
                    onChangeText={value => updateField('pincode', value.replace(/\D/g, '').slice(0, 6))}
                    style={styles.input}
                    placeholder="Pincode"
                    keyboardType="number-pad"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <Text style={[styles.fieldLabel, inter18('semiBold')]}>State</Text>
              <TextInput
                value={form.state}
                onChangeText={value => updateField('state', value)}
                style={styles.input}
                placeholder="State"
                placeholderTextColor="#9CA3AF"
              />

              {formError ? <Text style={[styles.errorText, inter18('medium')]}>{formError}</Text> : null}

              {editingId && onDeleteAddress ? (
                <Pressable onPress={handleDelete} style={styles.deleteBtn}>
                  <Text style={[styles.deleteBtnText, inter18('semiBold')]}>Delete address</Text>
                </Pressable>
              ) : null}
            </ScrollView>
          )}

          {mode === 'form' ? (
            <View style={styles.footer}>
              <Pressable
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={() => void handleSave()}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.saveBtnText, inter18('bold')]}>
                    {editingId ? 'Update address' : 'Save & deliver here'}
                  </Text>
                )}
              </Pressable>
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerSpacer: {
    width: 48,
  },
  headerTitle: {
    fontSize: 16,
    color: '#111827',
  },
  backText: {
    fontSize: 14,
    color: '#2563EB',
    width: 48,
  },
  closeText: {
    fontSize: 14,
    color: '#6B7280',
    width: 48,
    textAlign: 'right',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  addressCardSelected: {
    borderColor: '#5E02AF',
    backgroundColor: '#FAF5FF',
  },
  addressCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  labelPill: {
    backgroundColor: '#EDE9FE',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  labelPillText: {
    fontSize: 11,
    color: '#5B21B6',
  },
  defaultBadge: {
    fontSize: 11,
    color: '#047857',
  },
  cardName: {
    fontSize: 15,
    color: '#111827',
    marginBottom: 2,
  },
  cardPhone: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 6,
  },
  cardLine: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    paddingRight: 56,
  },
  editBtn: {
    position: 'absolute',
    right: 14,
    bottom: 14,
  },
  editBtnText: {
    fontSize: 13,
    color: '#2563EB',
  },
  addNewBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C4B5FD',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  addNewBtnText: {
    fontSize: 14,
    color: '#5E02AF',
  },
  formContent: {
    padding: 16,
    paddingBottom: 24,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 8,
    marginTop: 4,
  },
  labelRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  labelChip: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  labelChipActive: {
    borderColor: '#5E02AF',
    backgroundColor: '#F3E8FF',
  },
  labelChipText: {
    fontSize: 13,
    color: '#4B5563',
  },
  labelChipTextActive: {
    color: '#5E02AF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 4,
  },
  deleteBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 8,
  },
  deleteBtnText: {
    fontSize: 14,
    color: '#DC2626',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  saveBtn: {
    backgroundColor: '#5E02AF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
});

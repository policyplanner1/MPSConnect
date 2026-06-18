import React, { useCallback, useEffect, useState } from 'react';
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
import { TODO_CATEGORIES } from '../constants/todoCategories';
import type { TodoPriority, TodoTask } from '../types/todo';
import { createTaskId, formatTime12h, toDateIso } from '../utils/todoHelpers';
import { inter18 } from '../../../core/theme/typography';

const ACCENT = '#2563EB';

const PRIORITIES: { id: TodoPriority; label: string }[] = [
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

const TIME_OPTIONS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

type TodoFormScreenProps = {
  taskId: string | null;
  initialTask: TodoTask | null;
  onBack: () => void;
  onSave: (task: TodoTask) => void;
  onDelete?: (id: string) => void;
};

function buildDateOptions(): { label: string; value: string | null }[] {
  const opts: { label: string; value: string | null }[] = [
    { label: 'No date', value: null },
  ];
  const today = new Date();
  for (let i = 0; i < 30; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = toDateIso(d);
    let label = d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    if (i === 0) {
      label = 'Today';
    } else if (i === 1) {
      label = 'Tomorrow';
    }
    opts.push({ label, value: iso });
  }
  return opts;
}

const DATE_OPTIONS = buildDateOptions();

function TodoFormScreen({
  taskId,
  initialTask,
  onBack,
  onSave,
  onDelete,
}: TodoFormScreenProps) {
  const isEdit = Boolean(taskId && initialTask);

  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [notes, setNotes] = useState(initialTask?.notes ?? '');
  const [dueDate, setDueDate] = useState<string | null>(initialTask?.dueDate ?? null);
  const [dueTime, setDueTime] = useState<string | null>(initialTask?.dueTime ?? null);
  const [priority, setPriority] = useState<TodoPriority>(initialTask?.priority ?? 'medium');
  const [category, setCategory] = useState(
    initialTask?.category ?? TODO_CATEGORIES[0],
  );
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setNotes(initialTask.notes);
      setDueDate(initialTask.dueDate);
      setDueTime(initialTask.dueTime);
      setPriority(initialTask.priority);
      setCategory(initialTask.category);
    }
  }, [initialTask]);

  const dueDateLabel =
    DATE_OPTIONS.find(o => o.value === dueDate)?.label ??
    (dueDate
      ? new Date(dueDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Pick date');

  const handleSave = useCallback(() => {
    const trimmed = title.trim();
    if (!trimmed) {
      Alert.alert('Title required', 'Please enter a task title.');
      return;
    }
    const now = new Date().toISOString();
    const task: TodoTask = {
      id: initialTask?.id ?? createTaskId(),
      title: trimmed,
      notes: notes.trim(),
      dueDate,
      dueTime,
      priority,
      category,
      completed: initialTask?.completed ?? false,
      completedAt: initialTask?.completedAt ?? null,
      createdAt: initialTask?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(task);
    onBack();
  }, [
    title,
    notes,
    dueDate,
    dueTime,
    priority,
    category,
    initialTask,
    onSave,
    onBack,
  ]);

  const handleDelete = () => {
    if (!taskId || !onDelete) {
      return;
    }
    Alert.alert('Delete task', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDelete(taskId);
          onBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader
        onBack={onBack}
        title={isEdit ? 'Edit task' : 'New task'}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={88}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {isEdit && onDelete ? (
            <Pressable hitSlop={8} onPress={handleDelete} style={styles.deleteRow}>
              <Text style={[styles.deleteText, inter18('medium')]}>Delete task</Text>
            </Pressable>
          ) : null}

          <View style={styles.card}>
            <Text style={[styles.label, inter18('medium')]}>Task title *</Text>
            <TextInput
              placeholder="e.g. Finish the report…"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, inter18('regular')]}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.card}>
            <Text style={[styles.label, inter18('medium')]}>Notes</Text>
            <TextInput
              multiline
              placeholder="Add details…"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.inputMultiline, inter18('regular')]}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.card, styles.half]}>
              <Text style={[styles.label, inter18('medium')]}>Due date</Text>
              <Pressable
                onPress={() => setDatePickerOpen(true)}
                style={styles.pickerBtn}>
                <Text
                  style={[
                    styles.pickerText,
                    inter18('regular'),
                    !dueDate && styles.pickerPlaceholder,
                  ]}>
                  {dueDateLabel}
                </Text>
              </Pressable>
            </View>
            <View style={[styles.card, styles.half]}>
              <Text style={[styles.label, inter18('medium')]}>Time</Text>
              <Pressable
                onPress={() => setTimePickerOpen(true)}
                style={styles.pickerBtn}>
                <Text
                  style={[
                    styles.pickerText,
                    inter18('regular'),
                    !dueTime && styles.pickerPlaceholder,
                  ]}>
                  {dueTime ? formatTime12h(dueTime) : 'Pick time'}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={[styles.label, inter18('medium')]}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map(p => {
                const selected = priority === p.id;
                const btnStyle =
                  p.id === 'high'
                    ? styles.priority_high
                    : p.id === 'medium'
                      ? styles.priority_medium
                      : styles.priority_low;
                const textStyle =
                  p.id === 'high'
                    ? styles.priorityText_high
                    : p.id === 'medium'
                      ? styles.priorityText_medium
                      : styles.priorityText_low;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setPriority(p.id)}
                    style={[styles.priorityBtn, selected && btnStyle]}>
                    <Text
                      style={[
                        styles.priorityText,
                        inter18(selected ? 'semiBold' : 'regular'),
                        selected && textStyle,
                      ]}>
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={[styles.label, inter18('medium')]}>Category</Text>
            <Pressable
              onPress={() => setCategoryPickerOpen(true)}
              style={styles.pickerBtn}>
              <Text style={[styles.pickerText, inter18('regular')]}>{category}</Text>
              <Text style={styles.chevron}>▾</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}>
            <Text style={[styles.saveBtnText, inter18('semiBold')]}>Save task</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerModal
        open={datePickerOpen}
        options={DATE_OPTIONS.map(o => ({ label: o.label, value: o.value ?? '' }))}
        selectedValue={dueDate ?? ''}
        title="Due date"
        onClose={() => setDatePickerOpen(false)}
        onSelect={v => {
          setDueDate(v === '' ? null : v);
          setDatePickerOpen(false);
        }}
      />

      <PickerModal
        open={timePickerOpen}
        options={[
          { label: 'No time', value: '' },
          ...TIME_OPTIONS.map(t => ({ label: formatTime12h(t), value: t })),
        ]}
        selectedValue={dueTime ?? ''}
        title="Time"
        onClose={() => setTimePickerOpen(false)}
        onSelect={v => {
          setDueTime(v === '' ? null : v);
          setTimePickerOpen(false);
        }}
      />

      <PickerModal
        open={categoryPickerOpen}
        options={TODO_CATEGORIES.map(c => ({ label: c, value: c }))}
        selectedValue={category}
        title="Category"
        onClose={() => setCategoryPickerOpen(false)}
        onSelect={v => {
          setCategory(v);
          setCategoryPickerOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

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
  options: { label: string; value: string }[];
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
                key={opt.value + opt.label}
                onPress={() => onSelect(opt.value)}
                style={[
                  styles.modalOption,
                  selectedValue === opt.value && styles.modalOptionActive,
                ]}>
                <Text
                  style={[
                    styles.modalOptionText,
                    inter18(selectedValue === opt.value ? 'semiBold' : 'regular'),
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
  safe: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  deleteRow: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  deleteText: {
    fontSize: 13,
    color: '#B91C1C',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
  },
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
  inputMultiline: {
    minHeight: 80,
    paddingTop: 12,
  },
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
    paddingVertical: 10,
  },
  pickerText: {
    fontSize: 14,
    color: '#111111',
    flex: 1,
  },
  pickerPlaceholder: {
    color: '#9CA3AF',
  },
  chevron: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  priority_high: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  priority_medium: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  priority_low: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  priorityText: {
    fontSize: 13,
    color: '#6B7280',
  },
  priorityText_high: {
    color: '#B91C1C',
  },
  priorityText_medium: {
    color: '#B45309',
  },
  priorityText_low: {
    color: '#047857',
  },
  saveBtn: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnPressed: {
    opacity: 0.88,
  },
  saveBtnText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  modalTitle: {
    fontSize: 16,
    color: '#111111',
    textAlign: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalList: {
    maxHeight: 320,
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  modalOptionActive: {
    backgroundColor: '#EFF6FF',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#111111',
  },
  modalCancel: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  modalCancelText: {
    fontSize: 15,
    color: '#6B7280',
  },
});

export default TodoFormScreen;

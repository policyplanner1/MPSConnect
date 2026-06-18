import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { inter18 } from '../../../core/theme/typography';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_CELL_SIZE = Math.floor((Dimensions.get('window').width - 32) / 7);
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type Props = {
  visible: boolean;
  title: string;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
};

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBeforeDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

function isAfterDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  const d = direction === 'left' ? 'M15 18L9 12L15 6' : 'M9 6l6 6-6 6';
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Path
        d={d}
        fill="none"
        stroke="#0b1c30"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </Svg>
  );
}

function CalendarPickerModal({
  visible,
  title,
  value,
  minimumDate,
  maximumDate,
  onClose,
  onSelect,
}: Props) {
  const [viewDate, setViewDate] = useState(startOfDay(value));
  const [selectedDate, setSelectedDate] = useState(startOfDay(value));
  const [showYearPicker, setShowYearPicker] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const normalized = startOfDay(value);
    setViewDate(normalized);
    setSelectedDate(normalized);
    setShowYearPicker(false);
  }, [value, visible]);

  const minDay = minimumDate ? startOfDay(minimumDate) : undefined;
  const maxDay = maximumDate ? startOfDay(maximumDate) : undefined;

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = minDay?.getFullYear() ?? currentYear - 80;
    const endYear = maxDay?.getFullYear() ?? currentYear + 10;
    const list: number[] = [];
    for (let year = endYear; year >= startYear; year -= 1) {
      list.push(year);
    }
    return list;
  }, [maxDay, minDay]);

  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();
    const cells: Array<Date | null> = [];

    for (let index = 0; index < firstWeekday; index += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }
    return cells;
  }, [viewDate]);

  const isDisabled = (date: Date) => {
    if (minDay && isBeforeDay(date, minDay)) {
      return true;
    }
    if (maxDay && isAfterDay(date, maxDay)) {
      return true;
    }
    return false;
  };

  const changeMonth = (delta: number) => {
    setViewDate(current => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  const handleConfirm = () => {
    onSelect(selectedDate);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={event => event.stopPropagation()}>
          <Text style={[styles.title, inter18('semiBold')]}>{title}</Text>

          <View style={styles.monthHeader}>
            <Pressable hitSlop={8} onPress={() => changeMonth(-12)} style={styles.navBtn}>
              <Text style={[styles.navYearText, inter18('bold')]}>{'<<'}</Text>
            </Pressable>
            <Pressable hitSlop={8} onPress={() => changeMonth(-1)} style={styles.navBtn}>
              <ChevronIcon direction="left" />
            </Pressable>
            <Pressable onPress={() => setShowYearPicker(current => !current)} style={styles.monthLabel}>
              <Text style={[styles.monthText, inter18('semiBold')]}>
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </Text>
            </Pressable>
            <Pressable hitSlop={8} onPress={() => changeMonth(1)} style={styles.navBtn}>
              <ChevronIcon direction="right" />
            </Pressable>
            <Pressable hitSlop={8} onPress={() => changeMonth(12)} style={styles.navBtn}>
              <Text style={[styles.navYearText, inter18('bold')]}>{'>>'}</Text>
            </Pressable>
          </View>

          {showYearPicker ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearRow}>
              {years.map(year => (
                <Pressable
                  key={year}
                  onPress={() => {
                    setViewDate(new Date(year, viewDate.getMonth(), 1));
                    setShowYearPicker(false);
                  }}
                  style={[
                    styles.yearChip,
                    year === viewDate.getFullYear() && styles.yearChipActive,
                  ]}>
                  <Text
                    style={[
                      styles.yearChipText,
                      inter18(year === viewDate.getFullYear() ? 'semiBold' : 'regular'),
                      year === viewDate.getFullYear() && styles.yearChipTextActive,
                    ]}>
                    {year}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          <View style={styles.weekdayRow}>
            {WEEKDAYS.map(day => (
              <Text key={day} style={[styles.weekday, inter18('medium')]}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {calendarCells.map((date, index) => {
              if (!date) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const disabled = isDisabled(date);
              const selected = isSameDay(date, selectedDate);
              const today = isSameDay(date, new Date());

              return (
                <Pressable
                  key={date.toISOString()}
                  disabled={disabled}
                  onPress={() => setSelectedDate(startOfDay(date))}
                  style={[
                    styles.dayCell,
                    selected && styles.dayCellSelected,
                    today && !selected && styles.dayCellToday,
                    disabled && styles.dayCellDisabled,
                  ]}>
                  <Text
                    style={[
                      styles.dayText,
                      inter18(selected ? 'semiBold' : 'regular'),
                      selected && styles.dayTextSelected,
                      disabled && styles.dayTextDisabled,
                    ]}>
                    {date.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, inter18('medium')]}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleConfirm} style={styles.confirmBtn}>
              <Text style={[styles.confirmText, inter18('semiBold')]}>Confirm</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 16,
    color: '#0b1c30',
    marginBottom: 12,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  navBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navYearText: {
    fontSize: 14,
    color: '#0b1c30',
  },
  monthLabel: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  monthText: {
    fontSize: 16,
    color: '#0b1c30',
  },
  yearRow: {
    marginBottom: 10,
    maxHeight: 44,
  },
  yearChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#eff4ff',
    marginRight: 8,
  },
  yearChipActive: {
    backgroundColor: '#0051d5',
  },
  yearChipText: {
    fontSize: 14,
    color: '#0b1c30',
  },
  yearChipTextActive: {
    color: '#ffffff',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#76777d',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayCell: {
    width: DAY_CELL_SIZE,
    height: DAY_CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  dayCellSelected: {
    backgroundColor: '#0051d5',
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: '#0051d5',
  },
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 14,
    color: '#0b1c30',
  },
  dayTextSelected: {
    color: '#ffffff',
  },
  dayTextDisabled: {
    color: '#76777d',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c6c6cd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: '#45464d',
  },
  confirmBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#0051d5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: 15,
    color: '#ffffff',
  },
});

export default CalendarPickerModal;

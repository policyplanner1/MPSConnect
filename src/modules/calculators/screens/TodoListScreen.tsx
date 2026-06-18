import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import CalculatorHeader from '../components/CalculatorHeader';
import TodoPriorityBadge from '../components/TodoPriorityBadge';
import TodoSnackbar from '../components/TodoSnackbar';
import type { TodoFilter, TodoTask } from '../types/todo';
import {
  formatDueMeta,
  formatHeaderDate,
  groupTasksForList,
  type TodoSection,
} from '../utils/todoHelpers';
import { loadTodos, saveTodos } from '../utils/todoStorage';
import { inter18 } from '../../../core/theme/typography';

const ACCENT = '#2563EB';
const UNDO_MS = 5000;

const FILTERS: { id: TodoFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'done', label: 'Done' },
];

type TodoListScreenProps = {
  onBack?: () => void;
  onAddTask: () => void;
  onEditTask: (task: TodoTask) => void;
  /** Increment to reload tasks from storage (e.g. after form save). */
  refreshToken?: number;
};

function SearchIcon() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Path
        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
        fill="#9CA3AF"
      />
    </Svg>
  );
}

function CheckIcon({ done }: { done: boolean }) {
  if (!done) {
    return <View style={styles.checkEmpty} />;
  }
  return (
    <View style={styles.checkDone}>
      <Svg height={12} viewBox="0 0 24 24" width={12}>
        <Path
          d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
          fill="#047857"
        />
      </Svg>
    </View>
  );
}

function PlusIcon() {
  return (
    <Svg height={24} viewBox="0 0 24 24" width={24}>
      <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#FFFFFF" />
    </Svg>
  );
}

type ListItem =
  | { type: 'header'; key: string; title: string }
  | { type: 'task'; key: string; task: TodoTask };

function TodoListScreen({
  onBack,
  onAddTask,
  onEditTask,
  refreshToken = 0,
}: TodoListScreenProps) {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const undoRef = useRef<{ task: TodoTask; timer: ReturnType<typeof setTimeout> } | null>(
    null,
  );

  const persist = useCallback(async (next: TodoTask[]) => {
    setTasks(next);
    await saveTodos(next);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loadTodos().then(data => {
      if (mounted) {
        setTasks(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [refreshToken]);

  useEffect(() => {
    return () => {
      if (undoRef.current?.timer) {
        clearTimeout(undoRef.current.timer);
      }
    };
  }, []);

  const sections = useMemo(
    () => groupTasksForList(tasks, filter, search),
    [tasks, filter, search],
  );

  const flatData = useMemo((): ListItem[] => {
    const items: ListItem[] = [];
    sections.forEach((section: TodoSection) => {
      items.push({ type: 'header', key: `h-${section.key}`, title: section.title });
      section.tasks.forEach(task => {
        items.push({ type: 'task', key: task.id, task });
      });
    });
    return items;
  }, [sections]);

  const clearUndo = useCallback(() => {
    if (undoRef.current?.timer) {
      clearTimeout(undoRef.current.timer);
    }
    undoRef.current = null;
    setSnackbarVisible(false);
  }, []);

  const showUndo = useCallback(
    (previous: TodoTask) => {
      clearUndo();
      const timer = setTimeout(() => {
        undoRef.current = null;
        setSnackbarVisible(false);
      }, UNDO_MS);
      undoRef.current = { task: previous, timer };
      setSnackbarMessage(`"${previous.title}" completed`);
      setSnackbarVisible(true);
    },
    [clearUndo],
  );

  const handleUndo = useCallback(() => {
    const snapshot = undoRef.current?.task;
    if (!snapshot) {
      return;
    }
    clearUndo();
    setTasks(prev => {
      const next = prev.map(t =>
        t.id === snapshot.id
          ? {
              ...snapshot,
              completed: false,
              completedAt: null,
              updatedAt: new Date().toISOString(),
            }
          : t,
      );
      void saveTodos(next);
      return next;
    });
  }, [clearUndo]);

  const toggleComplete = useCallback(
    (task: TodoTask) => {
      if (task.completed) {
        const next = tasks.map(t =>
          t.id === task.id
            ? {
                ...t,
                completed: false,
                completedAt: null,
                updatedAt: new Date().toISOString(),
              }
            : t,
        );
        void persist(next);
        return;
      }
      const previous = { ...task };
      const next = tasks.map(t =>
        t.id === task.id
          ? {
              ...t,
              completed: true,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : t,
      );
      void persist(next);
      showUndo(previous);
    },
    [tasks, persist, showUndo],
  );

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      return (
        <Text style={[styles.sectionHeader, inter18('medium')]}>{item.title}</Text>
      );
    }

    const { task } = item;
    const meta = formatDueMeta(task);

    return (
      <Pressable
        onPress={() => onEditTask(task)}
        style={({ pressed }) => [styles.taskRow, pressed && styles.taskRowPressed]}>
        <Pressable
          hitSlop={8}
          onPress={e => {
            e.stopPropagation?.();
            toggleComplete(task);
          }}
          accessibilityLabel={task.completed ? 'Mark incomplete' : 'Mark complete'}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.completed }}>
          <CheckIcon done={task.completed} />
        </Pressable>
        <View style={styles.taskBody}>
          <Text
            style={[
              styles.taskTitle,
              inter18(task.completed ? 'regular' : 'medium'),
              task.completed && styles.taskTitleDone,
            ]}
            numberOfLines={2}>
            {task.title}
          </Text>
          <View style={styles.taskMeta}>
            {meta ? (
              <Text
                style={[
                  styles.taskMetaText,
                  inter18('regular'),
                  task.completed && styles.taskMetaDone,
                ]}>
                {meta}
              </Text>
            ) : null}
            <TodoPriorityBadge priority={task.priority} />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CalculatorHeader onBack={onBack} title="My tasks" />
      <View style={styles.subHeader}>
        <Text style={[styles.dateLine, inter18('regular')]}>{formatHeaderDate()}</Text>
      </View>

      <View style={styles.searchWrap}>
        <SearchIcon />
        <TextInput
          placeholder="Search tasks…"
          placeholderTextColor="#9CA3AF"
          style={[styles.searchInput, inter18('regular')]}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => {
          const active = filter === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[styles.chip, active && styles.chipActive]}>
              <Text
                style={[
                  styles.chipText,
                  inter18(active ? 'semiBold' : 'regular'),
                  active && styles.chipTextActive,
                ]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={ACCENT} size="large" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={flatData.length === 0 ? styles.emptyList : styles.list}
          data={flatData}
          keyExtractor={item => item.key}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyTitle, inter18('semiBold')]}>No tasks yet</Text>
              <Text style={[styles.emptySub, inter18('regular')]}>
                Tap + to add your first task, or try another filter.
              </Text>
            </View>
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        accessibilityLabel="Add new task"
        accessibilityRole="button"
        onPress={onAddTask}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
        <PlusIcon />
      </Pressable>

      <TodoSnackbar
        actionLabel="Undo"
        message={snackbarMessage}
        visible={snackbarVisible}
        onAction={handleUndo}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  subHeader: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  dateLine: {
    fontSize: 12,
    color: '#6B7280',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    paddingHorizontal: 12,
    minHeight: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111111',
    paddingVertical: 8,
    margin: 0,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  chipText: {
    fontSize: 11,
    color: '#6B7280',
  },
  chipTextActive: {
    color: ACCENT,
  },
  list: {
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  sectionHeader: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  taskRowPressed: {
    backgroundColor: '#FAFAFA',
  },
  checkEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    marginTop: 1,
  },
  checkDone: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D1FAE5',
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  taskBody: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 14,
    color: '#111111',
    lineHeight: 20,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  taskMetaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  taskMetaDone: {
    color: '#9CA3AF',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    paddingHorizontal: 32,
    paddingTop: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    color: '#111111',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default TodoListScreen;

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { TodoTask } from '../types/todo';

const STORAGE_KEY = '@mpsconnect/todo_tasks';

export async function loadTodos(): Promise<TodoTask[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as TodoTask[];
  } catch {
    return [];
  }
}

export async function saveTodos(tasks: TodoTask[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export type TodoPriority = 'high' | 'medium' | 'low';

export type TodoFilter = 'all' | 'today' | 'upcoming' | 'done';

export type TodoTask = {
  id: string;
  title: string;
  notes: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: TodoPriority;
  category: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TodoDraft = Omit<
  TodoTask,
  'id' | 'completed' | 'completedAt' | 'createdAt' | 'updatedAt'
>;

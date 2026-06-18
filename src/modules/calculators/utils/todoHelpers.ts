import type { TodoFilter, TodoTask } from '../types/todo';

export function createTaskId(): string {
  return `todo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function parseDateOnly(iso: string | null): Date | null {
  if (!iso) {
    return null;
  }
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) {
    return null;
  }
  return new Date(y, m - 1, d);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isTaskDueToday(task: TodoTask, now = new Date()): boolean {
  if (!task.dueDate) {
    return true;
  }
  const due = parseDateOnly(task.dueDate);
  return due ? isSameDay(due, now) : false;
}

export function isTaskUpcoming(task: TodoTask, now = new Date()): boolean {
  if (!task.dueDate || task.completed) {
    return false;
  }
  const due = parseDateOnly(task.dueDate);
  if (!due) {
    return false;
  }
  return startOfDay(due).getTime() > startOfDay(now).getTime();
}

export function formatHeaderDate(now = new Date()): string {
  return now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatDueMeta(task: TodoTask, now = new Date()): string {
  if (task.completed && !task.dueDate) {
    return '';
  }
  const parts: string[] = [];
  if (task.dueDate) {
    const due = parseDateOnly(task.dueDate);
    if (due) {
      if (isSameDay(due, now)) {
        parts.push('Today');
      } else {
        parts.push(
          due.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          }),
        );
      }
    }
  } else if (!task.completed) {
    parts.push('No date');
  }
  if (task.dueTime) {
    parts.push(formatTime12h(task.dueTime));
  }
  return parts.join(' · ');
}

export function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return hhmm;
  }
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function toDateIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function matchesSearch(task: TodoTask, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return (
    task.title.toLowerCase().includes(q) ||
    task.notes.toLowerCase().includes(q) ||
    task.category.toLowerCase().includes(q)
  );
}

export function matchesFilter(
  task: TodoTask,
  filter: TodoFilter,
  now = new Date(),
): boolean {
  switch (filter) {
    case 'done':
      return task.completed;
    case 'today':
      return !task.completed && isTaskDueToday(task, now);
    case 'upcoming':
      return isTaskUpcoming(task, now);
    case 'all':
    default:
      return true;
  }
}

export function sortTasks(a: TodoTask, b: TodoTask): number {
  if (a.completed !== b.completed) {
    return a.completed ? 1 : -1;
  }
  const da = a.dueDate ?? '9999-12-31';
  const db = b.dueDate ?? '9999-12-31';
  if (da !== db) {
    return da.localeCompare(db);
  }
  const ta = a.dueTime ?? '99:99';
  const tb = b.dueTime ?? '99:99';
  return ta.localeCompare(tb);
}

export type TodoSection = {
  key: string;
  title: string;
  tasks: TodoTask[];
};

export function groupTasksForList(
  tasks: TodoTask[],
  filter: TodoFilter,
  search: string,
  now = new Date(),
): TodoSection[] {
  const filtered = tasks
    .filter(t => matchesFilter(t, filter, now))
    .filter(t => matchesSearch(t, search))
    .sort(sortTasks);

  if (filter === 'done') {
    return filtered.length
      ? [{ key: 'done', title: `Completed · ${filtered.length}`, tasks: filtered }]
      : [];
  }

  if (filter === 'today') {
    const todayTasks = filtered.filter(t => !t.completed);
    return todayTasks.length
      ? [
          {
            key: 'today',
            title: `Today · ${todayTasks.length} left`,
            tasks: todayTasks,
          },
        ]
      : [];
  }

  if (filter === 'upcoming') {
    return filtered.length
      ? [{ key: 'upcoming', title: 'Upcoming', tasks: filtered }]
      : [];
  }

  const todayOpen = filtered.filter(t => !t.completed && isTaskDueToday(t, now));
  const upcoming = filtered.filter(t => isTaskUpcoming(t, now));
  const doneInAll = filtered.filter(t => t.completed);

  const sections: TodoSection[] = [];
  if (todayOpen.length) {
    sections.push({
      key: 'today',
      title: `Today · ${todayOpen.length} left`,
      tasks: todayOpen,
    });
  }
  if (upcoming.length) {
    sections.push({ key: 'upcoming', title: 'Upcoming', tasks: upcoming });
  }
  if (doneInAll.length) {
    sections.push({
      key: 'done',
      title: `Completed · ${doneInAll.length}`,
      tasks: doneInAll,
    });
  }
  return sections;
}

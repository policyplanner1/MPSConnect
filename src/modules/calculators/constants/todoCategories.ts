export const TODO_CATEGORIES = [
  'Work',
  'Personal',
  'Finance',
  'Health',
  'Shopping',
  'Other',
] as const;

export type TodoCategory = (typeof TODO_CATEGORIES)[number];

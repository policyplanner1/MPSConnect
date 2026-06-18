export type GoalTypeId =
  | 'home'
  | 'education'
  | 'marriage'
  | 'retirement'
  | 'loan'
  | 'wealth'
  | 'emergency'
  | 'custom';

export type GoalTypeOption = {
  id: GoalTypeId;
  label: string;
  emoji: string;
  description: string;
  defaultCost: number;
  defaultYears: number;
};

export const GOAL_TYPES: GoalTypeOption[] = [
  {
    id: 'home',
    label: 'Buy a House',
    emoji: '🏠',
    description: 'Plan down payment or full house purchase amount.',
    defaultCost: 25_00_000,
    defaultYears: 10,
  },
  {
    id: 'education',
    label: 'Child Education',
    emoji: '🎓',
    description: 'Save for school, college, or higher education.',
    defaultCost: 5_00_000,
    defaultYears: 12,
  },
  {
    id: 'marriage',
    label: 'Child Marriage',
    emoji: '💍',
    description: 'Plan wedding and related expenses in advance.',
    defaultCost: 8_00_000,
    defaultYears: 8,
  },
  {
    id: 'retirement',
    label: 'Retirement Planning',
    emoji: '🌴',
    description: 'Build a corpus for a comfortable retirement.',
    defaultCost: 50_00_000,
    defaultYears: 25,
  },
  {
    id: 'loan',
    label: 'Loan Closing',
    emoji: '📉',
    description: 'Set aside funds to close loans early.',
    defaultCost: 5_00_000,
    defaultYears: 5,
  },
  {
    id: 'wealth',
    label: 'Wealth Creation',
    emoji: '📈',
    description: 'Grow long-term wealth through disciplined investing.',
    defaultCost: 10_00_000,
    defaultYears: 10,
  },
  {
    id: 'emergency',
    label: 'Emergency Fund',
    emoji: '🛡️',
    description: 'Keep 6–24 months of expenses as a safety net.',
    defaultCost: 3_00_000,
    defaultYears: 2,
  },
  {
    id: 'custom',
    label: 'Custom Goal',
    emoji: '🎯',
    description: 'Any personal financial target you want to plan.',
    defaultCost: 5_00_000,
    defaultYears: 10,
  },
];

export const DEFAULT_INFLATION_PERCENT = 6;
export const DEFAULT_RETURN_PERCENT = 12;

export const EMERGENCY_BACKUP_MONTHS = [6, 12, 24] as const;

export const INPUT_LIMITS = {
  minCost: 10_000,
  maxCost: 10_00_00_000,
  minAlreadyHave: 0,
  maxAlreadyHave: 10_00_00_000,
  minYears: 1,
  maxYears: 40,
  minInflation: 0,
  maxInflation: 15,
  minReturn: 0,
  maxReturn: 30,
  minAge: 18,
  maxAge: 80,
} as const;

export function getGoalById(id: GoalTypeId): GoalTypeOption {
  return GOAL_TYPES.find(g => g.id === id) ?? GOAL_TYPES[0];
}

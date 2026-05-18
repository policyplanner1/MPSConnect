/** @typedef {import('../services/rewards.service').RewardTransactionFilter} RewardTransactionFilter */

/** @type {RewardTransactionFilter[]} */
export const REWARD_TRANSACTION_FILTERS = [
  'all',
  'additions',
  'deductions',
  'expired',
];

/** @type {Record<RewardTransactionFilter, string>} */
export const REWARD_FILTER_LABELS = {
  all: 'All Transactions',
  additions: 'Additions',
  deductions: 'Deductions',
  expired: 'Expired',
};

/**
 * @param {import('../services/rewards.service').RewardTransaction[]} items
 * @param {RewardTransactionFilter} filter
 */
export function filterRewardTransactions(items, filter) {
  if (filter === 'all') {
    return items;
  }
  if (filter === 'additions') {
    return items.filter(item => item.type === 'addition');
  }
  if (filter === 'deductions') {
    return items.filter(item => item.type === 'deduction');
  }
  return items.filter(item => item.type === 'expired');
}

/**
 * @param {number} amount
 */
export function formatRewardAmount(amount) {
  const prefix = amount >= 0 ? '+ ' : '- ';
  return `${prefix}${Math.abs(amount)}`;
}

/**
 * @param {number} amount
 */
export function rewardAmountColor(amount) {
  if (amount > 0) {
    return '#16A34A';
  }
  return '#DC2626';
}

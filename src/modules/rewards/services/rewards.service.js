/** @typedef {'all' | 'additions' | 'deductions' | 'expired'} RewardTransactionFilter */

/**
 * @typedef {Object} RewardTransaction
 * @property {string} id
 * @property {string} dateLabel
 * @property {string} yearLabel
 * @property {string} title
 * @property {string} subtitle
 * @property {number} amount
 * @property {'addition' | 'deduction' | 'expired'} type
 */

/**
 * @typedef {Object} RewardBalance
 * @property {number} coins
 * @property {number} expiringCoins
 * @property {string} expiryDate
 * @property {string} conversionLabel
 * @property {number} totalEarnedRupees
 * @property {string} referralCode
 */

/** @type {RewardBalance} */
export const REWARD_BALANCE = {
  coins: 750,
  expiringCoins: 220,
  expiryDate: '25 Mar 2026',
  conversionLabel: '1 ⭐ = ₹1',
  totalEarnedRupees: 500,
  referralCode: 'HSPD1234',
};

/** @type {RewardTransaction[]} */
const MOCK_TRANSACTIONS = [
  {
    id: '1',
    dateLabel: 'Mar 05',
    yearLabel: '2026',
    title: 'Wallet Balance Used',
    subtitle: 'Order Id: 1234567890',
    amount: -450,
    type: 'deduction',
  },
  {
    id: '2',
    dateLabel: 'Mar 04',
    yearLabel: '2026',
    title: 'Refund Initiated',
    subtitle: 'Order Id: 9876543210',
    amount: 75,
    type: 'addition',
  },
  {
    id: '3',
    dateLabel: 'Mar 02',
    yearLabel: '2026',
    title: 'Coins earned on order',
    subtitle: 'Order Id: 5647382910',
    amount: 100,
    type: 'addition',
  },
  {
    id: '4',
    dateLabel: 'Feb 28',
    yearLabel: '2026',
    title: 'Sign Up Bonus',
    subtitle: 'Welcome reward',
    amount: 500,
    type: 'addition',
  },
  {
    id: '5',
    dateLabel: 'Feb 20',
    yearLabel: '2026',
    title: 'Coins expired',
    subtitle: 'Expiry 20 Feb 2026',
    amount: -220,
    type: 'expired',
  },
];

/**
 * @returns {Promise<{ balance: RewardBalance; transactions: RewardTransaction[] }>}
 */
export async function fetchRewardsData() {
  await new Promise(resolve => setTimeout(resolve, 80));
  return {
    balance: { ...REWARD_BALANCE },
    transactions: MOCK_TRANSACTIONS.map(item => ({ ...item })),
  };
}

export { MOCK_TRANSACTIONS };

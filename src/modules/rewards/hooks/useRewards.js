import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchRewardsData } from '../services/rewards.service';
import { filterRewardTransactions } from '../store/RewardsStore';

/**
 * @returns {{
 *   balance: import('../services/rewards.service').RewardBalance | null;
 *   transactions: import('../services/rewards.service').RewardTransaction[];
 *   loading: boolean;
 *   filter: import('../services/rewards.service').RewardTransactionFilter;
 *   setFilter: (filter: import('../services/rewards.service').RewardTransactionFilter) => void;
 *   refresh: () => Promise<void>;
 * }}
 */
export function useRewards() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(
    /** @type {import('../services/rewards.service').RewardTransactionFilter} */ ('all'),
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRewardsData();
      setBalance(data.balance);
      setTransactions(data.transactions);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibleTransactions = useMemo(
    () => filterRewardTransactions(transactions, filter),
    [transactions, filter],
  );

  return {
    balance,
    transactions: visibleTransactions,
    loading,
    filter,
    setFilter,
    refresh: load,
  };
}

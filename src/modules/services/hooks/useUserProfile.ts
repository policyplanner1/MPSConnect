import { useCallback, useEffect, useState } from 'react';

import {
  getCurrentUser,
  getAuthErrorMessage,
  type UserProfile,
} from '../../../services/auth.service';

export function getProfileInitials(name: string | undefined | null): string {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

type UseUserProfileResult = {
  profile: UserProfile | null;
  initials: string;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useUserProfile(): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCurrentUser();
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    profile,
    initials: getProfileInitials(profile?.name),
    loading,
    error,
    refresh,
  };
}

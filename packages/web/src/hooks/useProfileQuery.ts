'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchUserProfile } from '@/lib/api';

export const PROFILE_QUERY_KEYS = {
  profile: ['userProfile'] as const,
};

export function useUserProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.profile,
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000,
  });
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, getUserProfileQuery } from '@/lib/api';
import type { UserProfile } from '@/types/messaging';

export const PROFILE_QUERY_KEYS = {
  profile: ['userProfile'] as const,
};

export function useUserProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.profile,
    queryFn: async () => {
      const res = await apiClient.graphql({ query: getUserProfileQuery });
      return (res as any).data.getUserProfile as UserProfile;
    },
    staleTime: 5 * 60 * 1000,
  });
}

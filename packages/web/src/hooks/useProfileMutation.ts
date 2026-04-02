'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, setUserProfileMutation } from '@/lib/api';
import { PROFILE_QUERY_KEYS } from './useProfileQuery';
import type { UserProfile } from '@/types/messaging';

export function useSetUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { language: string; translationEnabled: boolean }) => {
      const res = await apiClient.graphql({
        query: setUserProfileMutation,
        variables: vars,
      });
      return (res as any).data.setUserProfile as UserProfile;
    },
    onSuccess: (data) => {
      qc.setQueryData(PROFILE_QUERY_KEYS.profile, data);
    },
  });
}

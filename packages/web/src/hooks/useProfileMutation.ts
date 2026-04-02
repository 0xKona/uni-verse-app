'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setUserProfile as setUserProfileApi } from '@/lib/api';
import { PROFILE_QUERY_KEYS } from './useProfileQuery';

export function useSetUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { language: string; translationEnabled: boolean }) => setUserProfileApi(vars),
    onSuccess: (data) => {
      qc.setQueryData(PROFILE_QUERY_KEYS.profile, data);
    },
  });
}

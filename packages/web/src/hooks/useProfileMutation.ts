'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setUserProfile as setUserProfileApi, fetchAvatarUploadUrl } from '@/lib/api';
import { updateUsername, updateAvatarUrl, changePassword } from '@/lib/auth';
import { PROFILE_QUERY_KEYS } from './useProfileQuery';
import { USER_QUERY_KEYS } from './useUserQuery';

export function useSetUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { language: string; translationEnabled: boolean }) => setUserProfileApi(vars),
    onSuccess: (data) => {
      qc.setQueryData(PROFILE_QUERY_KEYS.profile, data);
    },
  });
}

export function useUpdateUsername(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => updateUsername(username),
    onSuccess: () => qc.invalidateQueries({ queryKey: USER_QUERY_KEYS.user(userId) }),
  });
}

export function useUpdateAvatar(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const raw = await fetchAvatarUploadUrl(file.name);
      const { url, avatarUrl } = JSON.parse(raw);
      await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      await updateAvatarUrl(avatarUrl);
      return avatarUrl;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: USER_QUERY_KEYS.user(userId) }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changePassword(currentPassword, newPassword),
  });
}

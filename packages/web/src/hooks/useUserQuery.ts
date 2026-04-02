'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchUser, fetchUsers } from '@/lib/api';
import type { User } from '@/types/friends';

export const USER_QUERY_KEYS = {
  user: (id: string) => ['user', id] as const,
  users: (ids: string[]) => ['users', ...ids.sort()] as const,
};

/** Fetch a single user by ID */
export function useUser(id: string | null) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.user(id ?? ''),
    queryFn: () => fetchUser(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/** Fetch multiple users by IDs */
export function useUsers(ids: string[]) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.users(ids),
    queryFn: () => fetchUsers(ids),
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

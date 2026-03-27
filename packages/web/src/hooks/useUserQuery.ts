'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, getUserQuery, getUsersQuery } from '@/lib/api';
import type { User } from '@/types/friends';

export const USER_QUERY_KEYS = {
  user: (id: string) => ['user', id] as const,
  users: (ids: string[]) => ['users', ...ids.sort()] as const,
};

/** Fetch a single user by ID */
export function useUser(id: string | null) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.user(id ?? ''),
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient.graphql({ query: getUserQuery, variables: { id } });
      return (res as any).data.getUser as User | null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/** Fetch multiple users by IDs */
export function useUsers(ids: string[]) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.users(ids),
    queryFn: async () => {
      if (!ids.length) return [];
      const res = await apiClient.graphql({ query: getUsersQuery, variables: { ids } });
      return (res as any).data.getUsers as User[];
    },
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

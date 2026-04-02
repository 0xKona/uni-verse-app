'use client';

import { useMutation } from '@tanstack/react-query';
import { searchUsers } from '@/lib/api';

export function useSearchUsers() {
  return useMutation({
    mutationFn: (query: string) => searchUsers(query),
  });
}

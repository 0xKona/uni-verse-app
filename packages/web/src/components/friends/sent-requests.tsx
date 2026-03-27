'use client';

import { useState, useMemo } from 'react';
import { UserCard } from '@/components/ui/user-card';
import { EmptyState } from '@/components/ui/empty-state';
import { RequestModal } from './request-modal';
import { useSentRequests } from '@/hooks/useFriendsQuery';
import { useUsers } from '@/hooks/useUserQuery';
import type { FriendRequest } from '@/types/friends';

export function SentRequests() {
  const { data: requests = [], isLoading, error } = useSentRequests();
  const [selected, setSelected] = useState<FriendRequest | null>(null);

  // Fetch full user details for recipients
  const recipientIds = useMemo(() => requests.map(r => r.recipientId), [requests]);
  const { data: users = [] } = useUsers(recipientIds);
  const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

  if (isLoading) return <EmptyState message="Loading…" />;
  if (error) return <EmptyState message="Failed to load requests" />;
  if (!requests.length) return <EmptyState message="No sent requests." />;

  return (
    <>
      <ul className="flex flex-col gap-1">
        {requests.map((r) => {
          const user = userMap.get(r.recipientId) ?? { id: r.recipientId, username: r.recipientId };
          return (
            <UserCard
              key={r.recipientId}
              user={user}
              subtitle="Pending"
              onClick={() => setSelected(r)}
            />
          );
        })}
      </ul>
      <RequestModal request={selected} mode="sent" onClose={() => setSelected(null)} />
    </>
  );
}

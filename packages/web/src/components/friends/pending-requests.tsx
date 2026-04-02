"use client";

import { useState, useMemo } from "react";
import { UserCard } from "@/components/ui/user-card";
import { EmptyState } from "@/components/ui/empty-state";
import { RequestModal } from "./request-modal";
import { usePendingRequests } from "@/hooks/useFriendsQuery";
import { useUsers } from "@/hooks/useUserQuery";
import type { FriendRequest } from "@/types/friends";

export function PendingRequests() {
  const { data: requests = [], isLoading, error } = usePendingRequests();
  const [selected, setSelected] = useState<FriendRequest | null>(null);

  // Fetch full user details for senders
  const senderIds = useMemo(() => requests.map((r) => r.senderId), [requests]);
  const { data: users = [], isLoading: usersLoading } = useUsers(senderIds);
  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  if (isLoading || usersLoading) return <EmptyState message="Loading…" />;
  if (error) return <EmptyState message="Failed to load requests" />;
  if (!requests.length) return <EmptyState message="No pending requests." />;

  return (
    <>
      <ul className="flex flex-col gap-1">
        {requests.map((r) => {
          const user = userMap.get(r.senderId) ?? {
            id: r.senderId,
            username: r.senderId,
          };
          return (
            <UserCard
              key={r.senderId}
              user={user}
              subtitle="Wants to add you"
              onClick={() => setSelected(r)}
            />
          );
        })}
      </ul>
      <RequestModal
        request={selected}
        mode="received"
        onClose={() => setSelected(null)}
      />
    </>
  );
}

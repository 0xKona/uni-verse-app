"use client";

import { useState } from "react";
import { UserRow } from "@/components/ui/user-row";
import { EmptyState } from "@/components/ui/empty-state";
import { FriendRequestModal } from "./friend-request-modal";
import { usePendingRequests } from "@/hooks/useFriendsQuery";
import type { FriendRequest } from "@/types/friends";

/**
 * Displays pending friend requests received by the current user
 * Automatically refetches when cache is invalidated by mutations/subscriptions
 */
export function PendingRequests() {
    const { data: requests = [], isLoading, error } = usePendingRequests();
    const [selected, setSelected] = useState<FriendRequest | null>(null);

    if (isLoading) return <EmptyState message="Loading…" />;
    if (error) return <EmptyState message="Failed to load requests" />;
    if (!requests.length) return <EmptyState message="No pending requests." />;

    return (
        <>
            <ul className="flex flex-col gap-1">
                {requests.map((r) => (
                    <UserRow
                        key={r.senderId}
                        username={r.senderId}
                        subtitle="Wants to add you"
                        onClick={() => setSelected(r)}
                    />
                ))}
            </ul>
            <FriendRequestModal
                request={selected}
                mode="received"
                onClose={() => setSelected(null)}
            />
        </>
    );
}

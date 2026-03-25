"use client";

import { useState } from "react";
import { UserRow } from "@/components/ui/user-row";
import { EmptyState } from "@/components/ui/empty-state";
import { FriendRequestModal } from "./friend-request-modal";
import { useSentRequests } from "@/hooks/useFriendsQuery";
import type { FriendRequest } from "@/types/friends";

/**
 * Displays friend requests sent by the current user
 * Automatically refetches when cache is invalidated by mutations/subscriptions
 */
export function SentRequests() {
    const { data: requests = [], isLoading, error } = useSentRequests();
    const [selected, setSelected] = useState<FriendRequest | null>(null);

    if (isLoading) return <EmptyState message="Loading…" />;
    if (error) return <EmptyState message="Failed to load requests" />;
    if (!requests.length) return <EmptyState message="No sent requests." />;

    return (
        <>
            <ul className="flex flex-col gap-1">
                {requests.map((r) => (
                    <UserRow
                        key={r.recipientId}
                        username={r.recipientId}
                        subtitle="Pending"
                        onClick={() => setSelected(r)}
                    />
                ))}
            </ul>
            <FriendRequestModal
                request={selected}
                mode="sent"
                onClose={() => setSelected(null)}
            />
        </>
    );
}

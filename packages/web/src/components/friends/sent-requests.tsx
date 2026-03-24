"use client";

import { useState } from "react";
import { UserRow } from "@/components/ui/user-row";
import { EmptyState } from "@/components/ui/empty-state";
import { FriendRequestModal } from "./friend-request-modal";
import { useRequestList } from "@/hooks/useRequestList";
import { getSentRequestsQuery } from "@/lib/api";
import type { FriendRequest } from "@/types/friends";

export function SentRequests() {
    const { requests, loading, remove } = useRequestList(
        getSentRequestsQuery,
        "getSentRequests",
    );
    const [selected, setSelected] = useState<FriendRequest | null>(null);

    if (loading) return <EmptyState message="Loading…" />;
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
                onAction={(id) => remove(id, "recipientId")}
            />
        </>
    );
}

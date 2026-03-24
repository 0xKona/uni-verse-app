"use client";

import { useState } from "react";
import { UserRow } from "@/components/ui/user-row";
import { EmptyState } from "@/components/ui/empty-state";
import { FriendRequestModal } from "./friend-request-modal";
import { useRequestList } from "@/hooks/useRequestList";
import { getPendingRequestsQuery } from "@/lib/api";
import type { FriendRequest } from "@/types/friends";

export function PendingRequests() {
    const { requests, loading, remove } = useRequestList(
        getPendingRequestsQuery,
        "getPendingRequests",
    );
    const [selected, setSelected] = useState<FriendRequest | null>(null);

    if (loading) return <EmptyState message="Loading…" />;
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
                onAction={(id) => remove(id, "senderId")}
            />
        </>
    );
}

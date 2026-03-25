"use client";

import { useState } from "react";
import { UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { UserRow } from "@/components/ui/user-row";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient, searchUsersQuery } from "@/lib/api";
import { useSendFriendRequest } from "@/hooks/useFriendsMutation";
import type { User } from "@/types/friends";

/**
 * Dialog for searching and adding friends
 * Uses TanStack Query mutation for sending friend requests with loading states
 */
export function AddFriendDialog() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<User[]>([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");

    const sendFriendRequestMutation = useSendFriendRequest();
    const [sentIds, setSentIds] = useState<Set<string>>(new Set());

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setSearching(true);
        setError("");
        try {
            const res = await apiClient.graphql({
                query: searchUsersQuery,
                variables: { query },
            });
            setResults((res as any).data.searchUsers);
        } catch {
            setError("Search failed. Please try again.");
        } finally {
            setSearching(false);
        }
    };

    const handleSend = async (recipientId: string) => {
        try {
            await sendFriendRequestMutation.mutateAsync(recipientId);
            setSentIds((prev) => new Set(prev).add(recipientId));
        } catch {
            setError("Failed to send request.");
        }
    };

    const handleOpenChange = (val: boolean) => {
        setOpen(val);
        // Reset state on close
        if (!val) {
            setQuery("");
            setResults([]);
            setSentIds(new Set());
            setError("");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground text-sm px-2 py-1.5 rounded-md flex items-center cursor-pointer hover:bg-muted transition-colors">
                <UserPlus size={16} />
                Add Friend
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Friend</DialogTitle>
                </DialogHeader>

                {/* Search input */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                        placeholder="Search by username or email…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    <Button type="submit" size="icon" disabled={searching}>
                        <Search size={16} />
                    </Button>
                </form>

                {error && <p className="text-sm text-destructive">{error}</p>}

                {/* Search results — username shown first, email as subtitle */}
                {results.length > 0 && (
                    <ul className="flex flex-col gap-1 mt-1">
                        {results.map((user) => {
                            const isSent = sentIds.has(user.id);
                            const isSending =
                                sendFriendRequestMutation.isPending;
                            return (
                                <UserRow
                                    key={user.id}
                                    username={user.username}
                                    subtitle={user.email}
                                >
                                    <Button
                                        size="sm"
                                        variant={
                                            isSent ? "secondary" : "default"
                                        }
                                        disabled={isSent || isSending}
                                        onClick={() => handleSend(user.id)}
                                    >
                                        {isSending
                                            ? "Sending..."
                                            : isSent
                                              ? "Sent"
                                              : "Add"}
                                    </Button>
                                </UserRow>
                            );
                        })}
                    </ul>
                )}

                {results.length === 0 && query && !searching && (
                    <EmptyState message="No users found." />
                )}
            </DialogContent>
        </Dialog>
    );
}

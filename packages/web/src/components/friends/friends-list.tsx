"use client";

import { useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { UserRow } from "@/components/ui/user-row";
import { EmptyState } from "@/components/ui/empty-state";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFriends } from "@/hooks/useFriendsQuery";
import { useRemoveFriend } from "@/hooks/useFriendsMutation";
import type { FriendRequest } from "@/types/friends";
import { useEffect } from "react";

/**
 * Displays the current user's friends list
 * Automatically syncs via mutations and subscriptions
 * Context menu for unfriending
 */
export function FriendsList() {
    const { data: friends = [], isLoading, error } = useFriends();
    const removeFriendMutation = useRemoveFriend();
    const [currentUserId, setCurrentUserId] = useState("");
    const [confirmUnfriend, setConfirmUnfriend] = useState<string | null>(null);

    // Get current user's ID to determine peer IDs in friendships
    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await getCurrentUser();
                setCurrentUserId(user.username);
            } catch (error) {
                console.error("Failed to get current user:", error);
            }
        };
        loadUser();
    }, []);

    const handleUnfriend = async () => {
        if (!confirmUnfriend) return;
        try {
            await removeFriendMutation.mutateAsync(confirmUnfriend);
            setConfirmUnfriend(null);
        } catch (error) {
            console.error("Failed to unfriend:", error);
        }
    };

    const isRemoving = removeFriendMutation.isPending;

    if (isLoading) return <EmptyState message="Loading…" />;
    if (error) return <EmptyState message="Failed to load friends" />;
    if (!friends.length) return <EmptyState message="No friends yet." />;

    return (
        <>
            <ul className="flex flex-col gap-1">
                {friends.map((f) => {
                    // Determine the peer's ID (friend is either sender or recipient)
                    const peerId =
                        f.senderId === currentUserId
                            ? f.recipientId
                            : f.senderId;
                    return (
                        <ContextMenu key={peerId}>
                            <ContextMenuTrigger>
                                <UserRow username={peerId} />
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                                <ContextMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setConfirmUnfriend(peerId)}
                                >
                                    Unfriend
                                </ContextMenuItem>
                            </ContextMenuContent>
                        </ContextMenu>
                    );
                })}
            </ul>

            {/* Unfriend confirmation */}
            <AlertDialog
                open={!!confirmUnfriend}
                onOpenChange={(open) => !open && setConfirmUnfriend(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Unfriend {confirmUnfriend}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            They will be removed from your friends list. You can
                            send a new request later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRemoving}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleUnfriend}
                            disabled={isRemoving}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isRemoving ? "Removing..." : "Unfriend"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Error feedback */}
            {removeFriendMutation.isError && (
                <p className="text-sm text-destructive">
                    Failed to remove friend. Please try again.
                </p>
            )}
        </>
    );
}

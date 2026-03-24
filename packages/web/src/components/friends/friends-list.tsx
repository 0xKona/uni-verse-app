"use client";

import { useEffect, useState } from "react";
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
import { apiClient, getFriendsQuery, removeFriendMutation } from "@/lib/api";
import type { FriendRequest } from "@/types/friends";

export function FriendsList() {
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmUnfriend, setConfirmUnfriend] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [res, user] = await Promise.all([
          apiClient.graphql({ query: getFriendsQuery }),
          getCurrentUser(),
        ]);
        setFriends((res as any).data.getFriends);
        setCurrentUserId(user.username);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleUnfriend = async () => {
    if (!confirmUnfriend) return;
    await apiClient.graphql({ query: removeFriendMutation, variables: { friendId: confirmUnfriend } });
    setFriends(prev => prev.filter(f => f.senderId !== confirmUnfriend && f.recipientId !== confirmUnfriend));
    setConfirmUnfriend(null);
  };

  if (loading) return <EmptyState message="Loading…" />;
  if (!friends.length) return <EmptyState message="No friends yet." />;

  return (
    <>
      <ul className="flex flex-col gap-1">
        {friends.map(f => {
          const peerId = f.senderId === currentUserId ? f.recipientId : f.senderId;
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
      <AlertDialog open={!!confirmUnfriend} onOpenChange={open => !open && setConfirmUnfriend(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unfriend {confirmUnfriend}?</AlertDialogTitle>
            <AlertDialogDescription>
              They will be removed from your friends list. You can send a new request later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnfriend} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Unfriend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

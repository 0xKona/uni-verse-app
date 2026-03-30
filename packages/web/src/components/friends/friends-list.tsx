'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { UserCard } from '@/components/ui/user-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useFriends } from '@/hooks/useFriendsQuery';
import { useUsers } from '@/hooks/useUserQuery';
import { useRemoveFriend } from '@/hooks/useFriendsMutation';
import type { User } from '@/types/friends';

interface FriendsListProps {
  onSelectFriend?: (userId: string) => void;
}

export function FriendsList({ onSelectFriend }: FriendsListProps = {}) {
  const { data: friends = [], isLoading, error } = useFriends();
  const removeFriend = useRemoveFriend();
  const [currentUserId, setCurrentUserId] = useState('');
  const [confirmUnfriend, setConfirmUnfriend] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then((u) => setCurrentUserId(u.username)).catch(console.error);
  }, []);

  // Extract peer IDs from friend requests
  const peerIds = useMemo(() => {
    if (!currentUserId) return [];
    return friends.map(f => f.senderId === currentUserId ? f.recipientId : f.senderId);
  }, [friends, currentUserId]);

  // Fetch full user details for all peers
  const { data: users = [] } = useUsers(peerIds);

  // Map user IDs to User objects
  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  if (isLoading) return <EmptyState message="Loading…" />;
  if (error) return <EmptyState message="Failed to load friends" />;
  if (!friends.length) return <EmptyState message="No friends yet." />;

  const handleUnfriend = async () => {
    if (!confirmUnfriend) return;
    try {
      await removeFriend.mutateAsync(confirmUnfriend.id);
      setConfirmUnfriend(null);
    } catch (err) {
      console.error('Failed to unfriend:', err);
    }
  };

  return (
    <>
      <ul className="flex flex-col gap-1">
        {peerIds.map((peerId) => {
          const user = userMap.get(peerId) ?? { id: peerId, username: peerId };
          return (
            <ContextMenu key={peerId}>
              <ContextMenuTrigger>
                <UserCard user={user} onClick={onSelectFriend ? () => onSelectFriend(user.id) : undefined} />
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setConfirmUnfriend(user)}
                >
                  Unfriend
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </ul>

      <AlertDialog open={!!confirmUnfriend} onOpenChange={(open) => !open && setConfirmUnfriend(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unfriend {confirmUnfriend?.username}?</AlertDialogTitle>
            <AlertDialogDescription>
              They will be removed from your friends list. You can send a new request later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeFriend.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnfriend}
              disabled={removeFriend.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeFriend.isPending ? 'Removing...' : 'Unfriend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {removeFriend.isError && (
        <p className="text-sm text-destructive">Failed to remove friend. Please try again.</p>
      )}
    </>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRespondToFriendRequest, useCancelFriendRequest } from '@/hooks/useFriendsMutation';
import { useUser } from '@/hooks/useUserQuery';
import type { FriendRequest } from '@/types/friends';

interface RequestModalProps {
  request: FriendRequest | null;
  mode: 'sent' | 'received';
  onClose: () => void;
}

export function RequestModal({ request, mode, onClose }: RequestModalProps) {
  const respond = useRespondToFriendRequest();
  const cancel = useCancelFriendRequest();
  const [submitting, setSubmitting] = useState(false);

  const peerId = request ? (mode === 'sent' ? request.recipientId : request.senderId) : null;
  const { data: user } = useUser(peerId);

  if (!request) return null;

  const displayUser = user ?? { id: peerId!, username: peerId! };
  const isLoading = submitting || respond.isPending || cancel.isPending;

  const handleCancel = async () => {
    setSubmitting(true);
    try {
      await cancel.mutateAsync(request.recipientId);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (accept: boolean) => {
    setSubmitting(true);
    try {
      await respond.mutateAsync({ senderId: request.senderId, accept });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{mode === 'sent' ? 'Sent Request' : 'Friend Request'}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 py-2">
          <Avatar className="h-12 w-12">
            {displayUser.avatarUrl && <AvatarImage src={displayUser.avatarUrl} alt={displayUser.username} />}
            <AvatarFallback>{displayUser.username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{displayUser.username}</span>
            {displayUser.email && (
              <span className="text-xs text-muted-foreground">{displayUser.email}</span>
            )}
            <span className="text-xs text-muted-foreground">
              {mode === 'sent' ? 'Awaiting response' : 'Wants to be your friend'}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Sent {new Date(request.createdAt).toLocaleDateString()}
        </p>

        <Separator />

        <div className="flex gap-2 justify-end">
          {mode === 'sent' ? (
            <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
              {isLoading ? 'Canceling...' : 'Cancel Request'}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleRespond(false)} disabled={isLoading}>
                {isLoading ? 'Declining...' : 'Decline'}
              </Button>
              <Button onClick={() => handleRespond(true)} disabled={isLoading}>
                {isLoading ? 'Accepting...' : 'Accept'}
              </Button>
            </>
          )}
        </div>

        {(respond.isError || cancel.isError) && (
          <p className="text-sm text-destructive">Failed to process request. Please try again.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

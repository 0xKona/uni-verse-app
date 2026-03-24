"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/ui/user-avatar";
import { apiClient, cancelFriendRequestMutation, respondToFriendRequestMutation } from "@/lib/api";
import type { FriendRequest } from "@/types/friends";

interface FriendRequestModalProps {
  request: FriendRequest | null;
  mode: "sent" | "received";
  onClose: () => void;
  /** Called with the peer's ID after a successful action, for optimistic list removal. */
  onAction: (peerId: string) => void;
}

export function FriendRequestModal({ request, mode, onClose, onAction }: FriendRequestModalProps) {
  const [loading, setLoading] = useState(false);

  if (!request) return null;

  const peerId = mode === "sent" ? request.recipientId : request.senderId;
  const subtitle = mode === "sent" ? "Awaiting response" : "Wants to be your friend";

  const handleCancel = async () => {
    setLoading(true);
    await apiClient.graphql({ query: cancelFriendRequestMutation, variables: { recipientId: request.recipientId } });
    onAction(request.recipientId);
    onClose();
  };

  const handleRespond = async (accept: boolean) => {
    setLoading(true);
    await apiClient.graphql({ query: respondToFriendRequestMutation, variables: { senderId: request.senderId, accept } });
    onAction(request.senderId);
    onClose();
  };

  return (
    <Dialog open={!!request} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{mode === "sent" ? "Sent Request" : "Friend Request"}</DialogTitle>
        </DialogHeader>

        {/* User info */}
        <div className="flex items-center gap-4 py-2">
          <UserAvatar username={peerId} className="h-12 w-12" />
          <div className="flex flex-col">
            <span className="font-medium">{peerId}</span>
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Sent {new Date(request.createdAt).toLocaleDateString()}
        </p>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          {mode === "sent" ? (
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              Cancel Request
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleRespond(false)} disabled={loading}>
                Decline
              </Button>
              <Button onClick={() => handleRespond(true)} disabled={loading}>
                Accept
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

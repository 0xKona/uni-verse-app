"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
    useRespondToFriendRequest,
    useCancelFriendRequest,
} from "@/hooks/useFriendsMutation";
import type { FriendRequest } from "@/types/friends";

interface FriendRequestModalProps {
    request: FriendRequest | null;
    mode: "sent" | "received";
    onClose: () => void;
}

/**
 * Modal for viewing and responding to friend requests
 * Handles accept/decline (received) or cancel (sent) actions
 * Mutations automatically invalidate relevant caches
 */
export function FriendRequestModal({
    request,
    mode,
    onClose,
}: FriendRequestModalProps) {
    const respondMutation = useRespondToFriendRequest();
    const cancelMutation = useCancelFriendRequest();
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!request) return null;

    const peerId = mode === "sent" ? request.recipientId : request.senderId;
    const subtitle =
        mode === "sent" ? "Awaiting response" : "Wants to be your friend";
    const isLoading =
        isSubmitting || respondMutation.isPending || cancelMutation.isPending;

    const handleCancel = async () => {
        setIsSubmitting(true);
        try {
            await cancelMutation.mutateAsync(request.recipientId);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRespond = async (accept: boolean) => {
        setIsSubmitting(true);
        try {
            await respondMutation.mutateAsync({
                senderId: request.senderId,
                accept,
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={!!request} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "sent" ? "Sent Request" : "Friend Request"}
                    </DialogTitle>
                </DialogHeader>

                {/* User info */}
                <div className="flex items-center gap-4 py-2">
                    <UserAvatar username={peerId} className="h-12 w-12" />
                    <div className="flex flex-col">
                        <span className="font-medium">{peerId}</span>
                        <span className="text-xs text-muted-foreground">
                            {subtitle}
                        </span>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground">
                    Sent {new Date(request.createdAt).toLocaleDateString()}
                </p>

                <Separator />

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                    {mode === "sent" ? (
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={isLoading}
                        >
                            {isLoading ? "Canceling..." : "Cancel Request"}
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => handleRespond(false)}
                                disabled={isLoading}
                            >
                                {respondMutation.isPending
                                    ? "Declining..."
                                    : "Decline"}
                            </Button>
                            <Button
                                onClick={() => handleRespond(true)}
                                disabled={isLoading}
                            >
                                {respondMutation.isPending
                                    ? "Accepting..."
                                    : "Accept"}
                            </Button>
                        </>
                    )}
                </div>

                {/* Error message if mutation fails */}
                {(respondMutation.isError || cancelMutation.isError) && (
                    <p className="text-sm text-destructive">
                        Failed to process request. Please try again.
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}

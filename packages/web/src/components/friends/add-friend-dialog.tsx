"use client";

import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserCard } from "@/components/ui/user-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useSearchUsers } from "@/hooks/useSearchUsers";
import { useSendFriendRequest } from "@/hooks/useFriendsMutation";

export function AddFriendDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const search = useSearchUsers();
  const sendRequest = useSendFriendRequest();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    search.mutate(query);
  };

  const handleSend = (userId: string) => {
    sendRequest.mutate(userId, {
      onSuccess: () => setSentIds((prev) => new Set(prev).add(userId)),
    });
  };

  const resetState = () => {
    setQuery("");
    search.reset();
    setSentIds(new Set());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetState();
      }}
    >
      <DialogTrigger className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground text-sm px-2 py-1.5 rounded-md flex items-center cursor-pointer hover:bg-muted transition-colors">
        <UserPlus size={16} />
        Add Friend
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search by username or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <Button type="submit" size="icon" disabled={search.isPending}>
            <Search size={16} />
          </Button>
        </form>

        {search.isError && (
          <p className="text-sm text-destructive">
            Search failed. Please try again.
          </p>
        )}
        {sendRequest.isError && (
          <p className="text-sm text-destructive">Failed to send request.</p>
        )}

        {(search.data?.length ?? 0) > 0 && (
          <ul className="flex flex-col gap-1 mt-1">
            {search.data!.map((user) => {
              const isSent = sentIds.has(user.id);
              return (
                <UserCard key={user.id} user={user}>
                  <Button
                    size="sm"
                    variant={isSent ? "secondary" : "default"}
                    disabled={isSent || sendRequest.isPending}
                    onClick={() => handleSend(user.id)}
                  >
                    {sendRequest.isPending
                      ? "Sending..."
                      : isSent
                        ? "Sent"
                        : "Add"}
                  </Button>
                </UserCard>
              );
            })}
          </ul>
        )}

        {search.data?.length === 0 && query && !search.isPending && (
          <EmptyState message="No users found." />
        )}
      </DialogContent>
    </Dialog>
  );
}

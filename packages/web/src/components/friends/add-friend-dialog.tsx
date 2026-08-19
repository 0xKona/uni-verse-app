"use client";

import { useState } from "react";
import { Search, SearchX, UserPlus } from "lucide-react";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";

export function AddFriendDialog({
  iconOnly = false,
  asButton = false,
}: {
  iconOnly?: boolean;
  asButton?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const search = useSearchUsers();
  const sendRequest = useSendFriendRequest();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    search.mutate(query, {
      onError: () => toast.error("Search failed. Please try again."),
    });
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
      <DialogTrigger
        render={asButton ? <Button size="sm" variant="outline" /> : undefined}
        className={
          asButton
            ? undefined
            : cn(
                "flex items-center justify-center rounded-lg text-sidebar-foreground/70 hover:text-sidebar-accent-foreground cursor-pointer hover:bg-sidebar-accent transition-colors",
                iconOnly
                  ? "size-10"
                  : "w-full justify-start gap-2 text-muted-foreground hover:text-foreground text-sm px-2 py-1.5 rounded-md",
              )
        }
      >
        <UserPlus size={iconOnly ? 20 : 16} />
        {!iconOnly && "Add Friend"}
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
          <EmptyState
            icon={SearchX}
            title="No users found"
            description="Try a different username or email."
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserRow } from "@/components/ui/user-row";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient, searchUsersQuery, sendFriendRequestMutation } from "@/lib/api";
import type { User } from "@/types/friends";

export function AddFriendDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    try {
      const res = await apiClient.graphql({ query: searchUsersQuery, variables: { query } });
      setResults((res as any).data.searchUsers);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleSend = async (recipientId: string) => {
    try {
      await apiClient.graphql({ query: sendFriendRequestMutation, variables: { recipientId } });
      setSent(prev => new Set(prev).add(recipientId));
    } catch {
      setError("Failed to send request.");
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    // Reset state on close
    if (!val) { setQuery(""); setResults([]); setSent(new Set()); setError(""); }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
          <UserPlus size={16} />
          Add Friend
        </Button>
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
            onChange={e => setQuery(e.target.value)}
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
            {results.map(user => (
              <UserRow
                key={user.id}
                username={user.username}
                subtitle={user.email}
              >
                <Button
                  size="sm"
                  variant={sent.has(user.id) ? "secondary" : "default"}
                  disabled={sent.has(user.id)}
                  onClick={() => handleSend(user.id)}
                >
                  {sent.has(user.id) ? "Sent" : "Add"}
                </Button>
              </UserRow>
            ))}
          </ul>
        )}

        {results.length === 0 && query && !searching && (
          <EmptyState message="No users found." />
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { FriendRequest } from "@/types/friends";

/**
 * Fetches a list of friend requests using the provided GraphQL query.
 * Returns the list, a loading flag, and a setter for optimistic removal.
 */
export function useRequestList(query: string, dataKey: string) {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.graphql({ query });
        setRequests((res as any).data[dataKey]);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [query, dataKey]);

  const remove = (id: string, key: keyof FriendRequest) =>
    setRequests(prev => prev.filter(r => r[key] !== id));

  return { requests, loading, remove };
}

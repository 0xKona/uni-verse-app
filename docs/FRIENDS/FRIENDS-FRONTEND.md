# Friends Management - Frontend

## Overview

Friends UI uses TanStack Query for data fetching/caching and AppSync subscriptions for real-time updates.

## Components

```
components/friends/
├── FriendsList        # Display accepted friends (with unfriend)
├── PendingRequests    # Incoming requests (accept/decline)
├── SentRequests       # Outgoing requests (cancel)
├── AddFriendDialog    # Search and send requests
└── RequestModal       # View/respond to single request
```

### UserCard
Reusable component for displaying users:
```tsx
<UserCard user={user} subtitle="Optional text">
  <Button>Action</Button>
</UserCard>
```

## Hooks

### Queries (`useFriendsQuery.ts`)
```ts
useFriends()          // Get accepted friends
usePendingRequests()  // Get incoming requests
useSentRequests()     // Get outgoing requests
```

### Mutations (`useFriendsMutation.ts`)
```ts
useSendFriendRequest()       // Send request
useRespondToFriendRequest()  // Accept/decline
useCancelFriendRequest()     // Cancel sent request
useRemoveFriend()            // Unfriend
```

### User Data (`useUserQuery.ts`)
```ts
useUser(id)      // Fetch single user details
useUsers(ids)    // Batch fetch user details
```

### Subscriptions (`useFriendsSubscription.ts`)
```ts
useSubscribeFriendsRealtime()  // Enable all subscriptions
```

## Data Flow

1. **Load friends list** → `useFriends()` fetches `FriendRequest[]`
2. **Get user details** → Extract IDs, call `useUsers(ids)` for full profiles
3. **Display** → `UserCard` shows username, email, avatar
4. **Real-time** → Subscriptions update cache when others send/respond

## Cache Invalidation

Mutations auto-invalidate relevant queries:

| Mutation | Invalidates |
|----------|-------------|
| `sendFriendRequest` | `sent` |
| `respondToFriendRequest` | `pending`, `list` |
| `cancelFriendRequest` | `sent` |
| `removeFriend` | `list` |

## File Structure

```
src/
├── components/friends/    # UI components
├── hooks/
│   ├── useFriendsQuery.ts
│   ├── useFriendsMutation.ts
│   ├── useFriendsSubscription.ts
│   └── useUserQuery.ts
├── lib/api.ts             # GraphQL queries/mutations
└── types/friends.ts       # TypeScript types
```

## Usage Example

```tsx
// In dashboard layout - enable real-time updates
useSubscribeFriendsRealtime();

// Display friends
<FriendsList />
<PendingRequests />
<SentRequests />
<AddFriendDialog />
```

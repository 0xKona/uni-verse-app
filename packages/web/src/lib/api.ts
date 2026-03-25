import { generateClient } from 'aws-amplify/api';
import type { FriendRequest } from '@/types/friends';

export const apiClient = generateClient();

// ══════════════════════════════════════════════════════════════════════════════
// QUERIES - Read-only operations for fetching data
// ══════════════════════════════════════════════════════════════════════════════

export const searchUsersQuery = /* GraphQL */ `
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      username
      email
    }
  }
`;

export const getFriendsQuery = /* GraphQL */ `
  query GetFriends {
    getFriends {
      senderId
      recipientId
      status
      createdAt
    }
  }
`;

export const getPendingRequestsQuery = /* GraphQL */ `
  query GetPendingRequests {
    getPendingRequests {
      senderId
      recipientId
      status
      createdAt
    }
  }
`;

export const getSentRequestsQuery = /* GraphQL */ `
  query GetSentRequests {
    getSentRequests {
      senderId
      recipientId
      status
      createdAt
    }
  }
`;

// ══════════════════════════════════════════════════════════════════════════════
// MUTATIONS - Write operations that modify data
// ══════════════════════════════════════════════════════════════════════════════

export const sendFriendRequestMutation = /* GraphQL */ `
  mutation SendFriendRequest($recipientId: ID!) {
    sendFriendRequest(recipientId: $recipientId) {
      senderId
      recipientId
      status
      createdAt
    }
  }
`;

export const cancelFriendRequestMutation = /* GraphQL */ `
  mutation CancelFriendRequest($recipientId: ID!) {
    cancelFriendRequest(recipientId: $recipientId)
  }
`;

export const respondToFriendRequestMutation = /* GraphQL */ `
  mutation RespondToFriendRequest($senderId: ID!, $accept: Boolean!) {
    respondToFriendRequest(senderId: $senderId, accept: $accept) {
      senderId
      recipientId
      status
      createdAt
    }
  }
`;

export const removeFriendMutation = /* GraphQL */ `
  mutation RemoveFriend($friendId: ID!) {
    removeFriend(friendId: $friendId) {
      senderId
      recipientId
      status
      createdAt
    }
  }
`;

// ══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTIONS - Real-time updates via WebSocket
// Triggered when data changes on the server (other users' actions)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Subscription: Triggered when a friend request is sent to the current user
 * Used to update pending requests list in real-time
 */
export const onFriendRequestReceived = /* GraphQL */ `
  subscription OnFriendRequestReceived($recipientId: ID!) {
    onFriendRequestReceived(recipientId: $recipientId) {
      senderId
      recipientId
      status
      createdAt
    }
  }
`;

/**
 * Subscription: Triggered when a friend request status changes (accepted/declined)
 * Used to update active request lists and friends list in real-time
 */
export const onFriendRequestUpdated = /* GraphQL */ `
  subscription OnFriendRequestUpdated($userId: ID!) {
    onFriendRequestUpdated(userId: $userId) {
      senderId
      recipientId
      status
      createdAt
    }
  }
`;

/**
 * Subscription: Triggered when a user is added/removed as a friend
 * Used to update the main friends list in real-time
 */
export const onFriendListUpdated = /* GraphQL */ `
  subscription OnFriendListUpdated($userId: ID!) {
    onFriendListUpdated(userId: $userId) {
      senderId
      recipientId
      status
      createdAt
    }
  }
`;

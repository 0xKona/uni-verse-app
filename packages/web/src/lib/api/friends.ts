import { typedQuery } from './client';
import type { FriendRequest } from '@/types/friends';

// GraphQL operations

export const getFriendsQuery = /* GraphQL */ `
  query GetFriends {
    getFriends { senderId recipientId status createdAt }
  }
`;

export const getPendingRequestsQuery = /* GraphQL */ `
  query GetPendingRequests {
    getPendingRequests { senderId recipientId status createdAt }
  }
`;

export const getSentRequestsQuery = /* GraphQL */ `
  query GetSentRequests {
    getSentRequests { senderId recipientId status createdAt }
  }
`;

export const sendFriendRequestMutation = /* GraphQL */ `
  mutation SendFriendRequest($recipientId: ID!) {
    sendFriendRequest(recipientId: $recipientId) { senderId recipientId status createdAt }
  }
`;

export const cancelFriendRequestMutation = /* GraphQL */ `
  mutation CancelFriendRequest($recipientId: ID!) {
    cancelFriendRequest(recipientId: $recipientId)
  }
`;

export const respondToFriendRequestMutation = /* GraphQL */ `
  mutation RespondToFriendRequest($senderId: ID!, $accept: Boolean!) {
    respondToFriendRequest(senderId: $senderId, accept: $accept) { senderId recipientId status createdAt }
  }
`;

export const removeFriendMutation = /* GraphQL */ `
  mutation RemoveFriend($friendId: ID!) {
    removeFriend(friendId: $friendId) { senderId recipientId status createdAt }
  }
`;

// Subscriptions

export const onFriendRequestReceived = /* GraphQL */ `
  subscription OnFriendRequestReceived($recipientId: ID!) {
    onFriendRequestReceived(recipientId: $recipientId) { senderId recipientId status createdAt }
  }
`;

export const onFriendRequestUpdated = /* GraphQL */ `
  subscription OnFriendRequestUpdated {
    onFriendRequestUpdated { senderId recipientId status createdAt }
  }
`;

export const onFriendListUpdated = /* GraphQL */ `
  subscription OnFriendListUpdated {
    onFriendListUpdated { senderId recipientId status createdAt }
  }
`;

// Typed functions

export const fetchFriends = () => typedQuery<FriendRequest[]>(getFriendsQuery, undefined, 'getFriends');
export const fetchPendingRequests = () => typedQuery<FriendRequest[]>(getPendingRequestsQuery, undefined, 'getPendingRequests');
export const fetchSentRequests = () => typedQuery<FriendRequest[]>(getSentRequestsQuery, undefined, 'getSentRequests');
export const sendFriendRequest = (recipientId: string) => typedQuery<FriendRequest>(sendFriendRequestMutation, { recipientId }, 'sendFriendRequest');
export const respondToFriendRequest = (senderId: string, accept: boolean) => typedQuery<FriendRequest>(respondToFriendRequestMutation, { senderId, accept }, 'respondToFriendRequest');
export const cancelFriendRequest = (recipientId: string) => typedQuery<void>(cancelFriendRequestMutation, { recipientId }, 'cancelFriendRequest');
export const removeFriend = (friendId: string) => typedQuery<void>(removeFriendMutation, { friendId }, 'removeFriend');

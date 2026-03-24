import { generateClient } from 'aws-amplify/api';

export const apiClient = generateClient();

// ── Queries ──────────────────────────────────────────────────────────────────

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



export const sendFriendRequestMutation = /* GraphQL */ `
  mutation SendFriendRequest($recipientId: ID!) {
    sendFriendRequest(recipientId: $recipientId) {
      senderId
      recipientId
      status
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
    }
  }
`;

export const removeFriendMutation = /* GraphQL */ `
  mutation RemoveFriend($friendId: ID!) {
    removeFriend(friendId: $friendId)
  }
`;

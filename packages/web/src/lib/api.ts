import { generateClient } from 'aws-amplify/api';
import type { FriendRequest } from '@/types/friends';

export const apiClient = generateClient();

// ══════════════════════════════════════════════════════════════════════════════
// QUERIES - Read-only operations for fetching data
// ══════════════════════════════════════════════════════════════════════════════

export const getUserQuery = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
    }
  }
`;

export const getUsersQuery = /* GraphQL */ `
  query GetUsers($ids: [ID!]!) {
    getUsers(ids: $ids) {
      id
      username
      email
    }
  }
`;

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
  subscription OnFriendRequestUpdated {
    onFriendRequestUpdated {
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
  subscription OnFriendListUpdated {
    onFriendListUpdated {
      senderId
      recipientId
      status
      createdAt
    }
  }
`;

// ══════════════════════════════════════════════════════════════════════════════
// MESSAGING - Chat & profile operations
// ══════════════════════════════════════════════════════════════════════════════

export const getChatsQuery = /* GraphQL */ `
  query GetChats {
    getChats {
      chatId
      chatType
      participantId
      lastMessage
      lastMessageAt
      lastReadAt
      archived
    }
  }
`;

export const getUserProfileQuery = /* GraphQL */ `
  query GetUserProfile {
    getUserProfile {
      language
      translationEnabled
    }
  }
`;

export const createChatMutation = /* GraphQL */ `
  mutation CreateChat($participantId: ID!) {
    createChat(participantId: $participantId) {
      chatId
      chatType
      participantId
      lastMessage
      lastMessageAt
      lastReadAt
      archived
    }
  }
`;

export const setUserProfileMutation = /* GraphQL */ `
  mutation SetUserProfile($language: String!, $translationEnabled: Boolean!) {
    setUserProfile(language: $language, translationEnabled: $translationEnabled) {
      language
      translationEnabled
    }
  }
`;

export const markChatReadMutation = /* GraphQL */ `
  mutation MarkChatRead($chatId: ID!) {
    markChatRead(chatId: $chatId)
  }
`;

export const sendMessageMutation = /* GraphQL */ `
  mutation SendMessage($chatId: ID!, $content: String!, $type: MessageType!, $attachments: [String]) {
    sendMessage(chatId: $chatId, content: $content, type: $type, attachments: $attachments) {
      chatId
      messageId
      senderId
      recipientId
      type
      content
      attachments
      translations
      createdAt
    }
  }
`;

export const getMessagesQuery = /* GraphQL */ `
  query GetMessages($chatId: ID!, $nextToken: String) {
    getMessages(chatId: $chatId, nextToken: $nextToken) {
      messages {
        chatId
        messageId
        senderId
        recipientId
        type
        content
        attachments
        translations
        createdAt
      }
      nextToken
    }
  }
`;

export const onMessageReceived = /* GraphQL */ `
  subscription OnMessageReceived($recipientId: ID!) {
    onMessageReceived(recipientId: $recipientId) {
      chatId
      messageId
      senderId
      recipientId
      type
      content
      attachments
      translations
      createdAt
    }
  }
`;

export const translateMessageMutation = /* GraphQL */ `
  mutation TranslateMessage($chatId: ID!, $messageId: ID!, $timestamp: String!) {
    translateMessage(chatId: $chatId, messageId: $messageId, timestamp: $timestamp) {
      chatId
      messageId
      senderId
      recipientId
      type
      content
      attachments
      translations
      createdAt
    }
  }
`;

export const getUploadUrlMutation = /* GraphQL */ `
  mutation GetUploadUrl($chatId: ID!, $fileName: String!) {
    getUploadUrl(chatId: $chatId, fileName: $fileName)
  }
`;

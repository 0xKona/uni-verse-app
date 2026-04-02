import { typedQuery } from './client';
import type { Chat, Message } from '@/types/messaging';

// GraphQL operations

const messageFields = `chatId messageId senderId recipientId type content attachments translations createdAt`;

export const getChatsQuery = /* GraphQL */ `
  query GetChats {
    getChats { chatId chatType participantId lastMessage lastMessageAt lastReadAt archived }
  }
`;

export const createChatMutation = /* GraphQL */ `
  mutation CreateChat($participantId: ID!) {
    createChat(participantId: $participantId) { chatId chatType participantId lastMessage lastMessageAt lastReadAt archived }
  }
`;

export const markChatReadMutation = /* GraphQL */ `
  mutation MarkChatRead($chatId: ID!) {
    markChatRead(chatId: $chatId)
  }
`;

export const getMessagesQuery = /* GraphQL */ `
  query GetMessages($chatId: ID!, $nextToken: String) {
    getMessages(chatId: $chatId, nextToken: $nextToken) {
      messages { ${messageFields} }
      nextToken
    }
  }
`;

export const sendMessageMutation = /* GraphQL */ `
  mutation SendMessage($chatId: ID!, $content: String!, $type: MessageType!, $attachments: [String]) {
    sendMessage(chatId: $chatId, content: $content, type: $type, attachments: $attachments) { ${messageFields} }
  }
`;

export const translateMessageMutation = /* GraphQL */ `
  mutation TranslateMessage($chatId: ID!, $messageId: ID!, $timestamp: String!) {
    translateMessage(chatId: $chatId, messageId: $messageId, timestamp: $timestamp) { ${messageFields} }
  }
`;

export const getUploadUrlMutation = /* GraphQL */ `
  mutation GetUploadUrl($chatId: ID!, $fileName: String!) {
    getUploadUrl(chatId: $chatId, fileName: $fileName)
  }
`;

export const sendTypingIndicatorMutation = /* GraphQL */ `
  mutation SendTypingIndicator($chatId: ID!) {
    sendTypingIndicator(chatId: $chatId) { chatId userId }
  }
`;

// Subscriptions

export const onMessageReceived = /* GraphQL */ `
  subscription OnMessageReceived($recipientId: ID!) {
    onMessageReceived(recipientId: $recipientId) { ${messageFields} }
  }
`;

export const onTypingIndicator = /* GraphQL */ `
  subscription OnTypingIndicator($chatId: ID!) {
    onTypingIndicator(chatId: $chatId) { chatId userId }
  }
`;

// Typed functions

export interface MessagePage { messages: Message[]; nextToken: string | null; }

export const fetchChats = () => typedQuery<Chat[]>(getChatsQuery, undefined, 'getChats');
export const createChat = (participantId: string) => typedQuery<Chat>(createChatMutation, { participantId }, 'createChat');
export const markChatRead = (chatId: string) => typedQuery<void>(markChatReadMutation, { chatId }, 'markChatRead');
export const fetchMessages = (chatId: string, nextToken?: string | null) => typedQuery<MessagePage>(getMessagesQuery, { chatId, nextToken: nextToken ?? null }, 'getMessages');
export const sendMessage = (vars: { chatId: string; content: string; type: string; attachments?: string[] }) => typedQuery<Message>(sendMessageMutation, vars, 'sendMessage');
export const translateMessage = (chatId: string, messageId: string, timestamp: string) => typedQuery<Message>(translateMessageMutation, { chatId, messageId, timestamp }, 'translateMessage');
export const getUploadUrl = (chatId: string, fileName: string) => typedQuery<string>(getUploadUrlMutation, { chatId, fileName }, 'getUploadUrl');

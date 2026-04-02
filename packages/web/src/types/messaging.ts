export interface Chat {
  chatId: string;
  chatType: 'DM' | 'GROUP' | 'CHANNEL';
  participantId: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastReadAt: string | null;
  archived: boolean;
}

export interface UserProfile {
  language: string;
  translationEnabled: boolean;
}

export interface Message {
  chatId: string;
  messageId: string;
  senderId: string;
  recipientId: string;
  type: 'TEXT' | 'IMAGE' | 'GIF' | 'FILE';
  content: string;
  attachments?: string[];
  translations?: string; // AWSJSON — parsed client-side
  createdAt: string;
}

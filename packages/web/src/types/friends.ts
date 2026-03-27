export interface User {
  id: string;
  username: string;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface FriendRequest {
  senderId: string;
  recipientId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

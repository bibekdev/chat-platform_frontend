export type ConversationType = 'direct' | 'group';
export type MemberRole = 'owner' | 'admin' | 'member';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface LastMessage {
  id: string;
  content: string | null;
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
  createdAt: string;
  sender: PublicUser | null;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  description: string | null;
  avatarUrl: string | null;
  createdBy: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessage: LastMessage | null;
}

export interface ConversationMember {
  id: string;
  conversationId: string;
  userId: string;
  role: MemberRole;
  nickname: string | null;
  lastMessageReadId: string | null;
  lastReadAt: string | null;
  joinedAt: string;
  leftAt: string | null;
  user: PublicUser;
}

export interface ConversationWithMembers extends Conversation {
  members: ConversationMember[];
}

export interface ConversationWithDetails extends ConversationWithMembers {
  unreadCount?: number;
}

// Request types
export interface CreateConversationRequest {
  type: ConversationType;
  name?: string;
  description?: string;
  avatarUrl?: string;
  memberIds: string[];
}

export interface UpdateConversationRequest {
  name?: string;
  description?: string | null;
  avatarUrl?: string | null;
}

export interface AddMembersRequest {
  memberIds: string[];
}

export interface UpdateMemberRoleRequest {
  role: 'admin' | 'member';
}

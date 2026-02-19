import { PublicUser } from '@/features/conversations/types';

export type ConversationWithMembers = {
  members: PublicUser[];
};

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';

export type MessageAttachment = {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  duration?: number;
  thumbnailUrl?: string;
  blurHash?: string;
};

export type Message = {
  id: string;
  content: string | null;
  type: MessageType;
  replyToId: string | null;
  forwardedFromId: string | null;
  isEdited: boolean;
  editedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedForEveryone: boolean;
  senderId: string;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown> | null;
};

export type MessageWithSender = Message & {
  sender: PublicUser;
};

export type MessageReaction = {
  id: string;
};

export type MessageWithDetails = Message & {
  sender: PublicUser;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  replyTo?: MessageWithSender;
};

export type CreateMessageDto = {
  content?: string;
  type?: MessageType;
  replyToId?: string;
  attachments?: MessageAttachment[];
};

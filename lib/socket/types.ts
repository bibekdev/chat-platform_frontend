import { PublicUser } from '@/features/conversations/types';
import { MessageWithDetails } from '@/features/messages/types';

export const SOCKET_EVENTS = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Server to client events

  //

  // Error event
  ERROR: 'error'
};

export const CONVERSATION_EVENTS = {
  // CLIENT -> SERVER
  SEND_MESSAGE: 'message:send',
  JOIN_CONVERSATION: 'conversation:join',
  LEAVE_CONVERSATION: 'conversation:leave',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  EDIT_MESSAGE: 'message:edit',
  DELETE_MESSAGE: 'message:delete',
  MARK_READ: 'message:read',
  ADD_REACTION: 'reaction:add',
  REMOVE_REACTION: 'reaction:remove',

  // SERVER -> CLIENT
  NEW_MESSAGE: 'message:new',
  USER_TYPING: 'user:typing',
  MESSAGE_UPDATED: 'message:updated',
  MESSAGE_DELETED: 'message:deleted',
  MESSAGE_READ: 'message:read:update'
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export interface SocketResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface NewMessageEvent {
  conversationId: string;
  message: MessageWithDetails;
}

export type TypingEvent = {
  conversationId: string;
  user: PublicUser;
  isTyping: boolean;
};

export interface TypingUser {
  user: PublicUser;
  timestamp: number;
}

export type MessageUpdatedEvent = {
  conversationId: string;
  message: MessageWithDetails;
};

export type MessageDeletedEvent = {
  conversationId: string;
  messageId: string;
  deletedForEveryone: boolean;
};

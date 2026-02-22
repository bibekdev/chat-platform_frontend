import { PublicUser } from '@/features/conversations/types';
import { MessageWithDetails } from '@/features/messages/types';

export const SOCKET_EVENTS = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Presence events (server -> client)
  USER_ONLINE: 'userOnline',
  USER_OFFLINE: 'userOffline',
  ONLINE_FRIENDS: 'onlineFriends',

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

export type MessageReadEvent = {
  conversationId: string;
  messageId: string;
  userId: string;
  readAt: string;
};

export const CALL_EVENTS = {
  // Call signaling (client -> server)
  CALL_INITIATE: 'call:initiate',
  CALL_ACCEPT: 'call:accept',
  CALL_REJECT: 'call:reject',
  CALL_OFFER: 'call:offer',
  CALL_ANSWER: 'call:answer',
  CALL_ICE_CANDIDATE: 'call:ice-candidate',
  CALL_END: 'call:end',

  // Call signaling (server -> client)
  CALL_INCOMING: 'call:incoming',
  CALL_ENDED: 'call:ended',
  CALL_PARTICIPANT_JOINED: 'call:participant-joined',
  CALL_PARTICIPANT_LEFT: 'call:participant-left'
} as const;

export interface UserOnlineEvent {
  userId: string;
  user: PublicUser;
}

export interface UserOfflineEvent {
  userId: string;
  user: PublicUser;
}

export interface OnlineFriendsEvent {
  userIds: string[];
}

export type CallEvent = (typeof CALL_EVENTS)[keyof typeof CALL_EVENTS];

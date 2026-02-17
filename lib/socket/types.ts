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

  // SERVER -> CLIENT
  NEW_MESSAGE: 'message:new'
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

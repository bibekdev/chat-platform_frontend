'use client';

import { createContext, useContext } from 'react';

import { socketManager, SocketStatus } from './socket-manager';
import { SocketResponse } from './types';

export interface SocketContextValue {
  isConnected: boolean;
  status: SocketStatus;

  // Connection methods
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;

  // Event subscription
  on: (event: string, callback: (data: unknown) => void) => void;
  off: (event: string, callback?: (...args: unknown[]) => void) => void;
  once: (event: string, callback: (data: unknown) => void) => void;

  // Generic emit
  emit: <T = unknown>(event: string, data?: unknown) => Promise<SocketResponse<T>>;
  emitNoAck: (event: string, data?: unknown) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function useSocketContext(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}

export function createSocketContextValue(
  isConnected: boolean,
  status: SocketStatus
): SocketContextValue {
  return {
    // State
    isConnected,
    status,

    // Connection methods
    connect: () => socketManager.connect(),
    disconnect: () => socketManager.disconnect(),
    reconnect: () => socketManager.reconnectWithNewToken(),

    // Event subscription
    on: <T>(event: string, callback: (data: T) => void) =>
      socketManager.on(event, callback),
    off: (event: string, callback?: (...args: unknown[]) => void) =>
      socketManager.off(event, callback),
    once: <T>(event: string, callback: (data: T) => void) =>
      socketManager.once(event, callback),

    // Generic emit
    emit: <T = unknown>(event: string, data?: unknown) =>
      socketManager.emit<T>(event, data),
    emitNoAck: (event: string, data?: unknown) => socketManager.emitNoAck(event, data)
  };
}

export { SocketContext };

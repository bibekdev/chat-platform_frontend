import { io, Socket } from 'socket.io-client';

import { getCookie } from '../utils';
import { SocketResponse } from './types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080';

const SOCKET_OPTIONS = {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling'] as ('websocket' | 'polling')[]
};

export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface SocketManagerEvents {
  statusChange: (status: SocketStatus) => void;
  error: (error: Error) => void;
}

class SocketManager {
  private socket: Socket | null = null;
  private status: SocketStatus = 'disconnected';
  private statusListeners: Set<(status: SocketStatus) => void> = new Set();
  private errorListeners: Set<(error: Error) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /*
   * Initialize and connect the socket
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected');
      return;
    }

    const token = getCookie('chat_accessToken');
    if (!token) {
      console.warn('[Socket] No access token available, cannot connect');
      return;
    }

    this.setStatus('connecting');

    this.socket = io(SOCKET_URL, {
      ...SOCKET_OPTIONS,
      auth: { token }
    });

    this.setupEventListeners();
    this.socket.connect();
  }

  /*
   * Disconnect the socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.setStatus('disconnected');
      this.reconnectAttempts = 0;
    }
  }

  /*
   * Reconnect with a new token (e.g., after token refresh)
   */
  reconnectWithNewToken(): void {
    this.disconnect();
    this.connect();
  }

  /*
   * Get the current socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /*
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /*
   * Get current connection status
   */
  getStatus(): SocketStatus {
    return this.status;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to server', this.socket?.id);
      this.setStatus('connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', reason => {
      console.log('[Socket] Disconnected from server', reason);
      this.setStatus('disconnected');

      // Handle reconnection for certain disconnect reason
      if (reason === 'io server disconnect') {
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', error => {
      console.error('[Socket] Connection error', error.message);
      this.setStatus('error');
      this.notifyError(error);

      // Handle auth errors
      if (
        error.message.includes('Authentication') ||
        error.message.includes('Unauthorized')
      ) {
        console.log('[Socket] Authentication error, triggering token refresh');
      }

      this.handleReconnect();
    });

    this.socket.on('', (payload: { event: string; message: string }) => {
      console.error('[Socket] Server event error', payload);
      this.notifyError(new Error(payload.message));
    });
  }

  private handleReconnect(): void {
    this.reconnectAttempts++;

    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 10000);
      console.log(
        `[Socket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        if (this.status !== 'connected') {
          this.connect();
        }
      }, delay);
    } else {
      console.error('[Socket] Max reconnection attempts reached');
      this.setStatus('error');
    }
  }

  private setStatus(status: SocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.notifyStatusChange(status);
    }
  }

  onStatusChange(callback: (status: SocketStatus) => void): () => void {
    this.statusListeners.add(callback);
    // Immediately notify with current status
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  onError(callback: (error: Error) => void): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  private notifyStatusChange(status: SocketStatus): void {
    this.statusListeners.forEach(listener => listener(status));
  }

  private notifyError(error: Error): void {
    this.errorListeners.forEach(listener => listener(error));
  }

  /*
   * Subscribe to a socket event
   */
  on<T>(event: string, callback: (data: T) => void): () => void {
    if (!this.socket) {
      console.warn('[Socket] Cannot subscribe, socket not initialized');
      return () => {};
    }

    this.socket.on(event, callback);

    // Return unsubscribe function
    return () => this.socket?.off(event, callback);
  }

  /*
   * Unsubscribe from a socket event
   */
  off<T>(event: string, callback?: (...args: unknown[]) => void): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  /*
   * Subscribe to an event once
   */
  once<T>(event: string, callback: (data: T) => void): void {
    if (!this.socket) {
      console.warn('[Socket] Cannot subscribe, socket not initialized');
      return;
    }

    this.socket.once(event, callback);
  }

  /*
   * Emit an event with optional acknowledgement
   */
  emit<T = unknown>(event: string, data?: unknown): Promise<SocketResponse<T>> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit(event, data, (response: SocketResponse<T>) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Unknown error'));
        }
      });
    });
  }

  /*
   * Emit without waiting for acknowledgement
   */
  emitNoAck(event: string, data?: unknown): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Cannot emit, socket not connected');
      return;
    }

    this.socket.emit(event, data);
  }
}

export const socketManager = new SocketManager();

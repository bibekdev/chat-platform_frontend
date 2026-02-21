import { createContext, useContext } from 'react';

import { PublicUser } from '@/features/conversations/types';
import { CallIncomingEvent, CallMediaType, CallState } from './types';

export interface CallContextValue {
  callState: CallState;
  callId: string | null;
  conversationId: string | null;
  participants: Map<string, PublicUser>;
  isMuted: boolean;
  isVideoEnabled: boolean;
  mediaType: CallMediaType;
  callDuration: number;
  incomingCall: CallIncomingEvent | null;
  isGroup: boolean;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;

  initiateCall: (conversationId: string, mediaType?: CallMediaType) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
}

export const CallContext = createContext<CallContextValue | null>(null);

export function useCallContext(): CallContextValue {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}

import { PublicUser } from '@/features/conversations/types';

export interface RTCConfiguration {
  bundlePolicy?: RTCBundlePolicy;
  certificates?: RTCCertificate[];
  iceCandidatePoolSize?: number;
  iceServers?: RTCIceServer[];
  iceTransportPolicy?: RTCIceTransportPolicy;
  rtcpMuxPolicy?: RTCRtcpMuxPolicy;
}

export interface PeerCallbacks {
  onRemoteStream: (peerId: string, stream: MediaStream) => void;
  onIceCandidate: (peerId: string, candidate: RTCIceCandidate) => void;
  onConnectionStateChange: (peerId: string, state: RTCPeerConnectionState) => void;
  onConnected: (peerId: string) => void;
  onPeerDisconnected: (peerId: string) => void;
}

export type CallState = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';
export type CallMediaType = 'audio' | 'video';

export interface ActiveCall {
  id: string;
  conversationId: string;
  initiatorId: string;
  participants: string[];
  startedAt: string;
  isGroup: boolean;
  mediaType: CallMediaType;
}

export interface CallIncomingEvent {
  callId: string;
  conversationId: string;
  caller: PublicUser;
  conversationName: string | null;
  isGroup: boolean;
  participants: string[];
  mediaType: CallMediaType;
}

export interface CallEndedEvent {
  callId: string;
  reason: 'ended' | 'rejected' | 'timeout' | 'error';
}

export interface CallParticipantEvent {
  callId: string;
  userId: string;
  user: PublicUser;
}

export interface CallOfferEvent {
  callId: string;
  fromUserId: string;
  sdp: RTCSessionDescriptionInit;
}

export interface CallAnswerEvent {
  callId: string;
  fromUserId: string;
  sdp: RTCSessionDescriptionInit;
}

export interface CallIceCandidateEvent {
  callId: string;
  fromUserId: string;
  candidate: RTCIceCandidateInit;
}

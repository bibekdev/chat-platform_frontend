'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { toast } from 'sonner';

import { PublicUser } from '@/features/conversations/types';
import { useSocket, useSocketEvents } from '@/hooks';
import { CALL_EVENTS } from '@/lib/socket';
import { CallContext, CallContextValue } from '@/lib/webrtc/call-context';
import { PeerConnectionManager } from '@/lib/webrtc/peer-manager';
import {
  ActiveCall,
  CallAnswerEvent,
  CallEndedEvent,
  CallIceCandidateEvent,
  CallIncomingEvent,
  CallMediaType,
  CallOfferEvent,
  CallParticipantEvent,
  CallState
} from '@/lib/webrtc/types';

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { emit, isConnected } = useSocket();

  const [callState, setCallState] = useState<CallState>('idle');
  const [callId, setCallId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Map<string, PublicUser>>(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [mediaType, setMediaType] = useState<CallMediaType>('audio');
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState<CallIncomingEvent | null>(null);
  const [isGroup, setIsGroup] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

  const peerManagerRef = useRef<PeerConnectionManager | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remoteAudiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const incomingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs that stay current for use inside PeerConnectionManager callbacks,
  // avoiding stale closures when callId changes after PM is created.
  // Set synchronously via helper functions — NOT via useEffect — so that
  // callbacks running in the same tick (e.g. ICE candidates during SDP
  // negotiation) always see the latest value.
  const callIdRef = useRef<string | null>(null);
  const incomingCallRef = useRef<CallIncomingEvent | null>(null);
  const callStateRef = useRef<CallState>('idle');

  const updateCallId = useCallback((id: string | null) => {
    callIdRef.current = id;
    setCallId(id);
  }, []);

  const updateCallState = useCallback((state: CallState) => {
    callStateRef.current = state;
    setCallState(state);
  }, []);

  const updateIncomingCall = useCallback((call: CallIncomingEvent | null) => {
    incomingCallRef.current = call;
    setIncomingCall(call);
  }, []);

  const cleanup = useCallback(() => {
    peerManagerRef.current?.closeAll();
    peerManagerRef.current = null;

    for (const [, audio] of remoteAudiosRef.current) {
      audio.pause();
      audio.srcObject = null;
    }
    remoteAudiosRef.current.clear();

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (incomingTimeoutRef.current) {
      clearTimeout(incomingTimeoutRef.current);
      incomingTimeoutRef.current = null;
    }

    updateCallState('idle');
    updateCallId(null);
    setConversationId(null);
    setParticipants(new Map());
    setIsMuted(false);
    setIsVideoEnabled(true);
    setMediaType('audio');
    setCallDuration(0);
    updateIncomingCall(null);
    setIsGroup(false);
    setLocalStream(null);
    setRemoteStreams(new Map());
  }, [updateCallState, updateCallId, updateIncomingCall]);

  const startDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) return;
    setCallDuration(0);
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const getPeerManager = useCallback(() => {
    if (peerManagerRef.current) return peerManagerRef.current;

    const pm = new PeerConnectionManager({
      onRemoteStream: (peerId, stream) => {
        setRemoteStreams(prev => {
          const next = new Map(prev);
          next.set(peerId, stream);
          return next;
        });

        let audio = remoteAudiosRef.current.get(peerId);
        if (!audio) {
          audio = new Audio();
          audio.autoplay = true;
          remoteAudiosRef.current.set(peerId, audio);
        }
        audio.srcObject = stream;
      },
      onIceCandidate: (peerId, candidate) => {
        const currentCallId = callIdRef.current;
        if (currentCallId) {
          emit(CALL_EVENTS.CALL_ICE_CANDIDATE, {
            callId: currentCallId,
            targetUserId: peerId,
            candidate: candidate.toJSON()
          });
        }
      },
      onConnectionStateChange: () => {},
      onConnected: () => {
        updateCallState('connected');
        startDurationTimer();
      },
      onPeerDisconnected: () => {}
    });

    peerManagerRef.current = pm;
    return pm;
  }, [emit, startDurationTimer, updateCallState]);

  const initiateCall = useCallback(
    async (convId: string, callMediaType: CallMediaType = 'audio') => {
      if (!isConnected || callStateRef.current !== 'idle') return;

      // Acquire media BEFORE changing state so a permission denial
      // doesn't leave us in a half-initialised 'ringing' state.

      const pm = getPeerManager();
      let stream: MediaStream;
      try {
        stream = await pm.acquireLocalStream(callMediaType === 'video');
      } catch (error) {
        console.error('[CallContext] Media permission denied:', error);
        pm.closeAll();
        peerManagerRef.current = null;
        return;
      }

      try {
        updateCallState('ringing');
        setConversationId(convId);
        setMediaType(callMediaType);
        setLocalStream(stream);

        if (callMediaType === 'video') {
          setIsVideoEnabled(true);
        }

        const response = await emit<ActiveCall>(CALL_EVENTS.CALL_INITIATE, {
          conversationId: convId,
          mediaType: callMediaType
        });

        if (!response.success || !response.data) {
          console.error(
            '[CallContext] Server rejected call initiation:',
            response?.error
          );
          toast.error(response?.error || 'Failed to start call');
          cleanup();
          return;
        }

        const call = response.data as unknown as ActiveCall;
        updateCallId(call.id);
        setIsGroup(call.isGroup);
      } catch (error) {
        console.error('[CallContext] Failed to initiate call:', error);
        cleanup();
      }
    },
    [isConnected, emit, getPeerManager, cleanup, updateCallState, updateCallId]
  );

  const acceptCall = useCallback(async () => {
    const current = incomingCallRef.current;
    if (!current || !isConnected) return;

    const incomingMediaType = current.mediaType ?? 'audio';

    const pm = getPeerManager();
    let stream: MediaStream;

    try {
      stream = await pm.acquireLocalStream(incomingMediaType === 'video');
    } catch (error) {
      console.error('[CallContext] Media permission denied:', error);
      pm.closeAll();
      peerManagerRef.current = null;
      emit(CALL_EVENTS.CALL_REJECT, { callId: current.callId });
      updateIncomingCall(null);
      return;
    }

    try {
      updateCallState('connecting');
      updateCallId(current.callId);
      setConversationId(current.conversationId);
      setIsGroup(current.isGroup);
      setMediaType(incomingMediaType);
      setLocalStream(stream);

      if (incomingTimeoutRef.current) {
        clearTimeout(incomingTimeoutRef.current);
        incomingTimeoutRef.current = null;
      }

      if (incomingMediaType === 'video') {
        setIsVideoEnabled(true);
      }

      await emit(CALL_EVENTS.CALL_ACCEPT, { callId: current.callId });
      updateIncomingCall(null);
    } catch (error) {
      console.error('[CallContext] Failed to accept call:', error);
      cleanup();
    }
  }, [
    isConnected,
    emit,
    getPeerManager,
    cleanup,
    updateCallState,
    updateCallId,
    updateIncomingCall
  ]);

  const rejectCall = useCallback(() => {
    const current = incomingCallRef.current;
    if (!current || !isConnected) return;

    emit(CALL_EVENTS.CALL_REJECT, { callId: current.callId });

    if (incomingTimeoutRef.current) {
      clearTimeout(incomingTimeoutRef.current);
      incomingTimeoutRef.current = null;
    }
    updateIncomingCall(null);
  }, [isConnected, emit, updateIncomingCall]);

  const endCall = useCallback(() => {
    const currentCallId = callIdRef.current;
    if (!currentCallId || !isConnected) {
      cleanup();
      return;
    }

    emit(CALL_EVENTS.CALL_END, { callId: currentCallId });
    cleanup();
  }, [isConnected, emit, cleanup]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      peerManagerRef.current?.toggleMute(next);
      return next;
    });
  }, []);

  const toggleVideo = useCallback(() => {
    setIsVideoEnabled(prev => {
      const next = !prev;
      peerManagerRef.current?.toggleVideo(next);
      return next;
    });
  }, []);

  const handleCallIncoming = useCallback(
    (event: CallIncomingEvent) => {
      if (callStateRef.current !== 'idle') return;

      updateIncomingCall(event);

      incomingTimeoutRef.current = setTimeout(() => {
        updateIncomingCall(null);
        emit(CALL_EVENTS.CALL_REJECT, { callId: event.callId });
      }, 10000);
    },
    [emit, updateIncomingCall]
  );

  const handleCallParticipantJoined = useCallback(
    async (event: CallParticipantEvent) => {
      const currentCallId = callIdRef.current;
      if (!currentCallId || event.callId !== currentCallId) return;

      setParticipants(prev => {
        const next = new Map(prev);
        next.set(event.userId, event.user);
        return next;
      });

      try {
        const pm = getPeerManager();
        const offer = await pm.createOffer(event.userId);
        await emit(CALL_EVENTS.CALL_OFFER, {
          callId: currentCallId,
          targetUserId: event.userId,
          sdp: offer
        });
      } catch (error) {
        console.error('[CallContext] Failed to create offer for peer:', error);
      }
    },
    [emit, getPeerManager]
  );
  const handleCallOffer = useCallback(
    async (event: CallOfferEvent) => {
      const currentCallId = callIdRef.current;
      if (!currentCallId || event.callId !== currentCallId) return;

      try {
        const pm = getPeerManager();
        const answer = await pm.handleOffer(event.fromUserId, event.sdp);
        await emit(CALL_EVENTS.CALL_ANSWER, {
          callId: currentCallId,
          targetUserId: event.fromUserId,
          sdp: answer
        });
      } catch (error) {
        console.error('[CallContext] Failed to handle offer:', error);
      }
    },
    [emit, getPeerManager]
  );

  const handleCallAnswer = useCallback(
    async (event: CallAnswerEvent) => {
      const currentCallId = callIdRef.current;
      if (!currentCallId || event.callId !== currentCallId) return;
      try {
        const pm = getPeerManager();
        await pm.handleAnswer(event.fromUserId, event.sdp);
      } catch (error) {
        console.error('[CallContext] Failed to handle answer:', error);
      }
    },
    [getPeerManager]
  );

  const handleCallIceCandidate = useCallback(
    async (event: CallIceCandidateEvent) => {
      const currentCallId = callIdRef.current;
      if (!currentCallId || event.callId !== currentCallId) return;
      try {
        const pm = getPeerManager();
        await pm.addIceCandidate(event.fromUserId, event.candidate);
      } catch (error) {
        console.error('[CallContext] Failed to add ICE candidate:', error);
      }
    },
    [getPeerManager]
  );

  const handleCallParticipantLeft = useCallback((event: CallParticipantEvent) => {
    const currentCallId = callIdRef.current;
    if (!currentCallId || event.callId !== currentCallId) return;

    peerManagerRef.current?.closePeer(event.userId);
    const audio = remoteAudiosRef.current.get(event.userId);
    if (audio) {
      audio.pause();
      audio.srcObject = null;
      remoteAudiosRef.current.delete(event.userId);
    }

    setRemoteStreams(prev => {
      const next = new Map(prev);
      next.delete(event.userId);
      return next;
    });

    setParticipants(prev => {
      const next = new Map(prev);
      next.delete(event.userId);
      return next;
    });
  }, []);

  const handleCallEnded = useCallback(
    (event: CallEndedEvent) => {
      const currentCallId = callIdRef.current;

      // Dismiss matching incoming notification if present
      const currentIncoming = incomingCallRef.current;
      if (currentIncoming && event.callId === currentIncoming.callId) {
        if (incomingTimeoutRef.current) {
          clearTimeout(incomingTimeoutRef.current);
          incomingTimeoutRef.current = null;
        }
        updateIncomingCall(null);
      }

      // Only run full cleanup if this event matches the active call.
      // If callId is null the call was already cleaned up locally (e.g. the
      // caller pressed end) — don't cleanup again or we'd wipe a new call
      // that may have been started in the meantime.
      if (!currentCallId || event.callId !== currentCallId) return;

      cleanup();
    },
    [cleanup, updateIncomingCall]
  );

  useSocketEvents({
    [CALL_EVENTS.CALL_INCOMING]: handleCallIncoming,
    [CALL_EVENTS.CALL_PARTICIPANT_JOINED]: handleCallParticipantJoined,
    [CALL_EVENTS.CALL_OFFER]: handleCallOffer,
    [CALL_EVENTS.CALL_ANSWER]: handleCallAnswer,
    [CALL_EVENTS.CALL_ICE_CANDIDATE]: handleCallIceCandidate,
    [CALL_EVENTS.CALL_PARTICIPANT_LEFT]: handleCallParticipantLeft,
    [CALL_EVENTS.CALL_ENDED]: handleCallEnded
  });

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const value: CallContextValue = {
    callState,
    callId,
    conversationId,
    participants,
    isMuted,
    isVideoEnabled,
    mediaType,
    callDuration,
    incomingCall,
    isGroup,
    localStream,
    remoteStreams,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

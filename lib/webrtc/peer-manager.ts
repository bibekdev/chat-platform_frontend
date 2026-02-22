import { PeerCallbacks } from './types';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    {
      urls: 'stun:localhost:3478'
    },
    {
      urls: 'turn:localhost:3478',
      username: 'myuser',
      credential: 'mypassword'
    }
  ]
};

export class PeerConnectionManager {
  private peers = new Map<string, RTCPeerConnection>();
  private localStream: MediaStream | null = null;
  private callbacks: PeerCallbacks;
  private candidateBuffer = new Map<string, RTCIceCandidateInit[]>();
  private remoteDescSet = new Set<string>();
  private connectedFired = false;

  constructor(callbacks: PeerCallbacks) {
    this.callbacks = callbacks;
  }

  async acquireLocalStream(video = false): Promise<MediaStream> {
    if (this.localStream) {
      if (video && this.localStream.getVideoTracks().length === 0) {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = videoStream.getVideoTracks()[0];
        this.localStream.addTrack(videoTrack);

        for (const [, pc] of this.peers) {
          pc.addTrack(videoTrack, this.localStream);
        }
      }
      return this.localStream;
    }

    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
    return this.localStream;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  toggleVideo(enabled: boolean): void {
    if (!this.localStream) return;
    for (const track of this.localStream.getVideoTracks()) {
      track.enabled = enabled;
    }
  }

  private fireConnectedOnce(peerId: string) {
    if (this.connectedFired) return;
    this.connectedFired = true;
    this.callbacks.onConnected(peerId);
  }

  private createPeerConnection(peerId: string): RTCPeerConnection {
    const existing = this.peers.get(peerId);
    if (existing) {
      existing.close();
    }

    this.remoteDescSet.delete(peerId);
    this.candidateBuffer.delete(peerId);

    const pc = new RTCPeerConnection(RTC_CONFIG);

    if (this.localStream) {
      for (const track of this.localStream.getTracks()) {
        pc.addTrack(track, this.localStream);
      }
    }

    pc.onicecandidate = event => {
      if (event.candidate) {
        this.callbacks.onIceCandidate(peerId, event.candidate);
      }
    };

    pc.ontrack = event => {
      const stream = event.streams[0] ?? new MediaStream([event.track]);
      this.callbacks.onRemoteStream(peerId, stream);
      this.fireConnectedOnce(peerId);
    };

    pc.onconnectionstatechange = () => {
      this.callbacks.onConnectionStateChange(peerId, pc.connectionState);
      if (pc.connectionState === 'connected') {
        this.fireConnectedOnce(peerId);
      }
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.callbacks.onPeerDisconnected(peerId);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (
        pc.iceConnectionState === 'connected' ||
        pc.iceConnectionState === 'completed'
      ) {
        this.fireConnectedOnce(peerId);
      }
    };

    this.peers.set(peerId, pc);
    return pc;
  }

  private async flushCandidateBuffer(peerId: string): Promise<void> {
    const buffered = this.candidateBuffer.get(peerId);
    if (!buffered || buffered.length === 0) return;

    const pc = this.peers.get(peerId);
    if (!pc) return;

    this.candidateBuffer.delete(peerId);

    for (const candidate of buffered) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.warn('[PeerManager] Failed to add buffered ICE candidate:', error);
      }
    }
  }

  async createOffer(peerId: string): Promise<RTCSessionDescriptionInit> {
    const pc = this.createPeerConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }

  async handleOffer(
    peerId: string,
    sdp: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    const pc = this.createPeerConnection(peerId);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    this.remoteDescSet.add(peerId);
    await this.flushCandidateBuffer(peerId);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }

  async handleAnswer(peerId: string, sdp: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.peers.get(peerId);
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    this.remoteDescSet.add(peerId);
    await this.flushCandidateBuffer(peerId);
  }

  async addIceCandidate(peerId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.peers.get(peerId);
    if (!pc) return;

    if (!this.remoteDescSet.has(peerId)) {
      let buffer = this.candidateBuffer.get(peerId);
      if (!buffer) {
        buffer = [];
        this.candidateBuffer.set(peerId, buffer);
      }
      buffer.push(candidate);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.warn('[PeerManager] Failed to add ICE candidate:', error);
    }
  }

  toggleMute(muted: boolean): void {
    if (!this.localStream) return;
    for (const track of this.localStream.getAudioTracks()) {
      track.enabled = !muted;
    }
  }

  closePeer(peerId: string) {
    const pc = this.peers.get(peerId);
    if (pc) {
      pc.close();
      this.peers.delete(peerId);
    }
    this.remoteDescSet.delete(peerId);
    this.candidateBuffer.delete(peerId);
  }

  closeAll(): void {
    for (const [, pc] of this.peers) {
      pc.close();
    }
    this.peers.clear();
    this.remoteDescSet.clear();
    this.candidateBuffer.clear();
    this.connectedFired = false;

    if (this.localStream) {
      for (const track of this.localStream.getTracks()) {
        track.stop();
      }
      this.localStream = null;
    }
  }

  getPeerIds(): string[] {
    return Array.from(this.peers.keys());
  }
}

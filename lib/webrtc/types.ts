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

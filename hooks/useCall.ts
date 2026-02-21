import { useCallContext } from '@/lib/webrtc/call-context';

export function useCall() {
  return useCallContext();
}

import { useOnlinePresenceContext } from '@/providers/online-presence-provider';

export function useOnlinePresence() {
  return useOnlinePresenceContext();
}

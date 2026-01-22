import { useSocketContext } from '@/lib/socket';

export function useSocket() {
  return useSocketContext();
}

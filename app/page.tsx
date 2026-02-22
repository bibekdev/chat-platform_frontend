'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuthUser } from '@/features/auth/hooks';

export default function Home() {
  const { data: user } = useAuthUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/conversations');
    } else {
      router.push('/login');
    }
  }, [user]);

  return null;
}

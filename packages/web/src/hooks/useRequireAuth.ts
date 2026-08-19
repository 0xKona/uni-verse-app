'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { queryClient } from '@/lib/query-client';

export function useRequireAuth() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const redirectToLogin = () => {
      if (cancelled) return;
      queryClient.clear();
      router.replace('/login');
    };

    const checkSession = async () => {
      try {
        await fetchAuthSession();
        if (!cancelled) setAuthorized(true);
      } catch {
        redirectToLogin();
      }
    };

    checkSession();

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedOut' || payload.event === 'tokenRefresh_failure') {
        redirectToLogin();
      }
    });

    const onFocus = () => checkSession();

    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener('focus', onFocus);
    };
  }, [router]);

  return authorized;
}

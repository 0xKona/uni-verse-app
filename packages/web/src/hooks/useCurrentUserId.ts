'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';

export function useCurrentUserId() {
  const [userId, setUserId] = useState('');

  useEffect(() => {
    getCurrentUser().then(u => setUserId(u.username)).catch(console.error);
  }, []);

  return userId;
}

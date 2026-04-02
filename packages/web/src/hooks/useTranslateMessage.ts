'use client';

import { useMutation } from '@tanstack/react-query';
import { translateMessage } from '@/lib/api';

export function useTranslateMessage() {
  return useMutation({
    mutationFn: (vars: { chatId: string; messageId: string; timestamp: string }) =>
      translateMessage(vars.chatId, vars.messageId, vars.timestamp),
  });
}

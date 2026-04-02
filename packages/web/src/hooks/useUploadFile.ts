'use client';

import { useMutation } from '@tanstack/react-query';
import { getUploadUrl } from '@/lib/api';

interface UploadResult {
  key: string;
  previewUrl: string;
  isImage: boolean;
  fileName: string;
}

export function useUploadFile() {
  return useMutation({
    mutationFn: async ({ chatId, file }: { chatId: string; file: File }): Promise<UploadResult> => {
      const raw = await getUploadUrl(chatId, file.name);
      const { url, key } = JSON.parse(raw);
      await fetch(url, { method: 'PUT', body: file });
      return {
        key,
        previewUrl: URL.createObjectURL(file),
        isImage: file.type.startsWith('image/'),
        fileName: file.name,
      };
    },
  });
}

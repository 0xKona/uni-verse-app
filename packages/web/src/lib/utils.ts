import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeText(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}  

export function isUnread(lastReadAt: string, lastMessageAt: string): boolean {
  const isUnread =
    lastMessageAt &&
    lastReadAt &&
    lastMessageAt > lastReadAt;
  return !!isUnread
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);

  if (date >= today) return `Today at ${time}`;
  if (date >= yesterday) return `Yesterday at ${time}`;
  return `${date.getDate()} ${date.toLocaleString('en-GB', { month: 'short' })} at ${time}`;
}

export function getInitials(name: string): string {
  const initials = name[0]?.toUpperCase() ?? "?";
  return initials;
}

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  username: string;
  className?: string;
}

/** Displays a user avatar with their initial as a fallback. */
export function UserAvatar({ username, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("h-8 w-8", className)}>
      <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

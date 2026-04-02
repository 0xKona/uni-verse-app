import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { capitalizeText, cn } from "@/lib/utils";
import type { User } from "@/types/friends";

interface UserCardProps {
  user: User;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Displays a user with avatar, name, email/subtitle, and optional actions.
 * Uses shadcn Avatar component.
 */
export function UserCard({
  user,
  subtitle,
  onClick,
  className,
  children,
}: UserCardProps) {
  console.log({ user });
  const displaySubtitle = subtitle ?? "";
  const initials = user.username[0]?.toUpperCase() ?? "?";
  const username = capitalizeText(user.username);

  return (
    <li
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-muted",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-8 w-8 shrink-0">
          {user.avatarUrl && (
            <AvatarImage src={user.avatarUrl} alt={user.username} />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">{username}</span>
          {displaySubtitle && (
            <span className="text-xs text-muted-foreground truncate">
              {displaySubtitle}
            </span>
          )}
        </div>
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </li>
  );
}

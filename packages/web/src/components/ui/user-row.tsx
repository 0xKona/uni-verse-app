import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

interface UserRowProps {
  username: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/** A list row showing a user avatar, username, optional subtitle, and optional trailing content. */
export function UserRow({ username, subtitle, onClick, className, children }: UserRowProps) {
  return (
    <li
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-muted",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <UserAvatar username={username} />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">{username}</span>
          {subtitle && <span className="text-xs text-muted-foreground truncate">{subtitle}</span>}
        </div>
      </div>
      {children}
    </li>
  );
}

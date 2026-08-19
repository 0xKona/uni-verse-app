import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SideBarButtonProps {
  href?: string;
  active?: boolean;
  icon?: React.ComponentType<{ size: number }>;
  avatar?: React.ReactNode;
  label?: string;
  badge?: number;
  hideTooltip?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function SideBarButton({
  href,
  active,
  icon: Icon,
  avatar,
  label,
  badge,
  hideTooltip,
  onClick,
  children,
}: SideBarButtonProps) {
  const classes = cn(
    "relative flex items-center justify-center w-12 h-12 text-sidebar-foreground/70 transition-all duration-200 cursor-pointer",
    active
      ? "rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground"
      : "rounded-full hover:rounded-2xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  );

  const content = (
    <>
      {Icon && <Icon size={22} />}
      {avatar}
      {children}
      {!!badge && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </>
  );

  const inner = href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes} onClick={onClick}>
      {content}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger>{inner}</TooltipTrigger>
      {label && !hideTooltip && (
        <TooltipContent side="right">{label}</TooltipContent>
      )}
    </Tooltip>
  );
}

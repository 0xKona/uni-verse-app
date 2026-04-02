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
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function SideBarButton({
  href,
  active,
  icon: Icon,
  avatar,
  label,
  onClick,
  children,
}: SideBarButtonProps) {
  const classes = cn(
    "flex items-center justify-center w-12 h-12 bg-background text-muted-foreground transition-all duration-200 cursor-pointer",
    active
      ? "rounded-2xl bg-primary text-primary-foreground"
      : "rounded-full hover:rounded-2xl hover:bg-primary hover:text-primary-foreground",
  );

  const content = (
    <>
      {Icon && <Icon size={22} />}
      {avatar}
      {children}
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
      {label && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  );
}

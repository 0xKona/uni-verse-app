interface EmptyStateProps {
  message: string;
}

/** Simple muted message for empty or loading list states. */
export function EmptyState({ message }: EmptyStateProps) {
  return <p className="text-sm text-muted-foreground px-2">{message}</p>;
}

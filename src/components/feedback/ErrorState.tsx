import { EmptyState } from "./EmptyState";

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      tone="danger"
      icon="cloud-offline-outline"
      title="Couldn't load trips"
      message={message ?? "Check your connection and try again."}
      actionLabel="Try again"
      onAction={onRetry}
    />
  );
}

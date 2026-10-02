import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { ApiError } from "@/lib/api/client";

export function EmptyState({
  title,
  message,
  action,
  icon,
  className,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-3 rounded-md border border-dashed border-line px-6 py-10 md:px-10 md:py-14", className)}>
      {icon && <div className="mb-1 text-ink-faint [&_svg]:size-6">{icon}</div>}
      <h3 className="text-lg font-medium tracking-tight text-ink">{title}</h3>
      {message && <p className="max-w-md text-sm leading-relaxed text-ink-muted">{message}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  title = "Something went wrong",
  className,
}: {
  error?: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}) {
  const message =
    error instanceof ApiError
      ? error.status === 0
        ? error.message
        : error.isNotFound
          ? "We couldn't find what you were looking for."
          : error.message
      : "An unexpected error occurred. Please try again.";
  return (
    <div role="alert" className={cn("flex flex-col items-start gap-3 rounded-md border border-line bg-surface px-6 py-8 md:px-8", className)}>
      <CircleAlert className="size-5 text-danger" strokeWidth={1.5} aria-hidden />
      <h3 className="text-base font-medium text-ink">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-ink-muted">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}

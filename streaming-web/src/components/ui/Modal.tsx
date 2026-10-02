"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "./Button";

/**
 * Accessible modal built on the native <dialog> element: focus is trapped,
 * Escape closes it and focus returns to the trigger automatically.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className={cn(
        "m-auto w-[min(92vw,560px)] rounded-lg border border-line bg-surface p-0 text-ink shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] backdrop:bg-black/70 backdrop:backdrop-blur-[2px]",
        "opacity-0 transition-[opacity,transform,display,overlay] duration-300 ease-[var(--ease-cinema)] [transition-behavior:allow-discrete] open:opacity-100 starting:open:opacity-0 starting:open:translate-y-2",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h2 className="text-base font-medium tracking-tight">{title}</h2>
        <IconButton label="Close" size="sm" onClick={onClose}>
          <X strokeWidth={1.75} />
        </IconButton>
      </div>
      <div className="px-6 py-5">{children}</div>
    </dialog>
  );
}

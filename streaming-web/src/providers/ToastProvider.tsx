"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, CircleAlert, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "error";
interface Toast {
  id: number;
  message: string;
  tone: Tone;
  action?: { label: string; onClick: () => void };
}

interface ToastApi {
  show: (message: string, opts?: { tone?: Tone; action?: Toast["action"]; duration?: number }) => void;
  success: (message: string, action?: Toast["action"]) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const show = useCallback<ToastApi["show"]>(
    (message, { tone = "neutral", action, duration = 3600 } = {}) => {
      const id = ++seq.current;
      setToasts((t) => [...t.slice(-2), { id, message, tone, action }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (m, action) => show(m, { tone: "success", action }),
      error: (m) => show(m, { tone: "error", duration: 5200 }),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex flex-col items-center gap-2 px-4 md:bottom-8 md:items-end md:px-8"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = t.tone === "success" ? Check : t.tone === "error" ? CircleAlert : Info;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6, transition: { duration: 0.18 } }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                role={t.tone === "error" ? "alert" : "status"}
                className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-md border border-line bg-elevated/95 py-3 pl-4 pr-2 text-sm text-ink shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-sm"
              >
                <Icon aria-hidden className={cn("size-4 shrink-0", t.tone === "error" ? "text-danger" : "text-accent")} strokeWidth={1.75} />
                <span className="flex-1">{t.message}</span>
                {t.action && (
                  <button
                    type="button"
                    onClick={() => {
                      t.action!.onClick();
                      dismiss(t.id);
                    }}
                    className="rounded px-2 py-1 text-xs font-medium uppercase tracking-[0.12em] text-accent hover:text-accent-strong"
                  >
                    {t.action.label}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="rounded p-1.5 text-ink-muted hover:text-ink"
                >
                  <X className="size-3.5" strokeWidth={1.75} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

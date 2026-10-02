"use client";

// Development mock API. Remove this line (and src/mocks) once the backend is connected.
import "@/mocks/install";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";
import { ToastProvider } from "./ToastProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <QueryProvider>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </QueryProvider>
    </MotionConfig>
  );
}

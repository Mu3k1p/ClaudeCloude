import { AuthGate } from "@/components/layout/AuthGate";

export default function WatchLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}

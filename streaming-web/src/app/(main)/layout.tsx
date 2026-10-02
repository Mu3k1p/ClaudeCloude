import { AuthGate } from "@/components/layout/AuthGate";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Navbar } from "@/components/layout/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <Navbar />
      <main id="main" tabIndex={-1} className="min-h-dvh outline-none">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </AuthGate>
  );
}

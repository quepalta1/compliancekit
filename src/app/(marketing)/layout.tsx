import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      {/* Sticky Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#0F172A]" />
            <span className="text-lg font-bold tracking-tight text-[#0F172A]">
              ComplianceKit
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-[#0369A1] text-white hover:bg-[#0369A1]/90"
              >
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#0F172A]" />
                <span className="text-base font-bold tracking-tight text-[#0F172A]">
                  ComplianceKit
                </span>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground">
                Supplier assurance and framework compliance for modern enterprises.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#0F172A]">Product</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#0F172A]">
                Resources
              </h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <span className="text-sm text-muted-foreground">
                    Documentation
                  </span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">
                    NIS2 Guide
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#0F172A]">Legal</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <span className="text-sm text-muted-foreground">Privacy</span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">Terms</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-border/50 pt-6 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ComplianceKit. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

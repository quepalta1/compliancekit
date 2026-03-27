import { Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding & testimonial (hidden on mobile) */}
      <div className="hidden w-1/2 flex-col justify-between bg-[#0F172A] p-12 lg:flex">
        <div className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-white" />
          <span className="text-xl font-bold tracking-tight text-white">
            ComplianceKit
          </span>
        </div>

        <div className="max-w-md">
          <blockquote className="text-lg font-medium leading-relaxed text-slate-200">
            &ldquo;ComplianceKit transformed our NIS2 readiness process. What
            would have taken months with consultants, we accomplished in weeks
            — with full confidence in our compliance posture.&rdquo;
          </blockquote>
          <div className="mt-6">
            <p className="text-sm font-semibold text-white">Maria Schneider</p>
            <p className="text-sm text-slate-400">
              CISO, Nordic Secure GmbH
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} ComplianceKit
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center bg-[#F8FAFC] px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <Shield className="h-6 w-6 text-[#0F172A]" />
            <span className="text-lg font-bold tracking-tight text-[#0F172A]">
              ComplianceKit
            </span>
          </div>

          <div className="rounded-xl border border-border/50 bg-white p-8 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

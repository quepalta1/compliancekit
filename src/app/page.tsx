import Link from "next/link";
import { Shield, ClipboardCheck, FileText, FolderCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            ComplianceKit
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            NIS2 &amp; ISO 27001 readiness for European SMEs
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Self-service compliance assessment, evidence tracking, and policy
            generation &mdash; so you can focus on running your business.
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Get started free
          </Link>
          <Link
            href="/pricing"
            className="rounded-md border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted"
          >
            View pricing
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ClipboardCheck,
              title: "NIS2 Assessment",
              desc: "Evaluate compliance across all Article 21(2) controls.",
            },
            {
              icon: FileText,
              title: "Policy Generation",
              desc: "AI-drafted policies tailored to your organization.",
            },
            {
              icon: FolderCheck,
              title: "Evidence Vault",
              desc: "Upload and organize compliance evidence in one place.",
            },
            {
              icon: Shield,
              title: "Action Plans",
              desc: "Prioritized remediation steps to close gaps fast.",
            },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

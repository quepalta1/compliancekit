import Link from "next/link";
import {
  Shield,
  ClipboardList,
  Building2,
  ClipboardCheck,
  FileText,
  FolderCheck,
  Target,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: ClipboardList,
    title: "Supplier Requirements",
    description:
      "Define buyer-specific compliance requirements — from security and privacy to sustainability and labor standards — and track supplier responses.",
  },
  {
    icon: Building2,
    title: "Network Visibility",
    description:
      "Connect suppliers to your workspace, monitor their compliance status in real time, and identify gaps across your supply chain.",
  },
  {
    icon: ClipboardCheck,
    title: "Framework Readiness",
    description:
      "Assess compliance against NIS2, ISO 27001, and other regulatory frameworks with guided questionnaires and automatic scoring.",
  },
  {
    icon: FileText,
    title: "Policy Generation",
    description:
      "AI-drafted security policies tailored to your organization, aligned with NIS2 and ISO 27001 requirements.",
  },
  {
    icon: FolderCheck,
    title: "Evidence Vault",
    description:
      "Upload, organize, and track compliance evidence in a centralized repository with expiry alerts.",
  },
  {
    icon: Target,
    title: "Action Plans",
    description:
      "Prioritized remediation steps with clear ownership and deadlines to close compliance gaps fast.",
  },
];

const steps = [
  {
    number: "1",
    title: "Define",
    description:
      "Set up your workspace, define buyer-specific supplier requirements, and connect your suppliers — or run a framework readiness assessment.",
  },
  {
    number: "2",
    title: "Connect",
    description:
      "Link supplier organizations to your network. Suppliers see your requirements and submit compliance responses with supporting evidence.",
  },
  {
    number: "3",
    title: "Verify",
    description:
      "Monitor supplier compliance in real time, track progress across your network, and demonstrate assurance to stakeholders and auditors.",
  },
];

const trustCompanies = [
  "TechCorp EU",
  "Nordic Secure",
  "DataVault GmbH",
  "Meridian Labs",
  "Sentinel IO",
  "CloudBridge",
];

export default function HomePage() {
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

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32">
        {/* Gradient blob decoration */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#0369A1]/20 via-[#0369A1]/5 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-[#0F172A]/10 via-[#0F172A]/5 to-transparent blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 px-3 py-1 text-xs">
            Trusted by 100+ European companies
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl">
            Supplier Compliance,{" "}
            <span className="text-[#0369A1]">Simplified.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            The supplier assurance platform that helps companies define, track, and verify compliance requirements across their supplier network — with built-in NIS2 and ISO 27001 readiness.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                className="h-12 gap-2 bg-[#0369A1] px-8 text-base text-white hover:bg-[#0369A1]/90"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                Book a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-border/30 bg-white/60 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
            Trusted by 100+ European companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {trustCompanies.map((company) => (
              <Badge
                key={company}
                variant="secondary"
                className="px-4 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {company}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">
              Everything you need for supplier compliance
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Manage buyer-defined requirements and regulatory frameworks in one unified platform.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-border/50 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0369A1]/10">
                    <feature.icon className="h-5 w-5 text-[#0369A1]" />
                  </div>
                  <CardTitle className="mt-3 text-base">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border/30 bg-white px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From requirements to verified compliance in three steps.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0F172A] text-xl font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl rounded-2xl bg-[#0F172A] px-8 py-16 text-center shadow-xl sm:px-16">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Ready to assure your supply chain?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-300">
            Join hundreds of organizations using ComplianceKit to manage supplier compliance, framework readiness, and evidence — all in one place.
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button
                size="lg"
                className="h-12 gap-2 bg-[#0369A1] px-8 text-base text-white hover:bg-[#0369A1]/90"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

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

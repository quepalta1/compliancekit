import Link from "next/link";
import { Check, X } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing – ComplianceKit",
  description:
    "Simple, transparent pricing for NIS2 and ISO 27001 compliance. Start free.",
};

const plans = [
  {
    name: "Free",
    price: "€0",
    period: "",
    description: "Get started with basic compliance tools.",
    features: {
      assessments: "1 assessment / month",
      policies: "1 policy generation / month",
      evidence: "25 evidence items",
      members: "1 member",
      pdf: false,
    },
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "€49",
    period: "/mo",
    description: "For small businesses getting compliant.",
    features: {
      assessments: "5 assessments / month",
      policies: "10 policy generations / month",
      evidence: "100 evidence items",
      members: "1 member",
      pdf: true,
    },
    cta: "Start with Starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "€149",
    period: "/mo",
    description: "For growing teams with serious compliance needs.",
    features: {
      assessments: "25 assessments / month",
      policies: "50 policy generations / month",
      evidence: "500 evidence items",
      members: "5 members",
      pdf: true,
    },
    cta: "Go Pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: "€249",
    period: "/mo",
    description: "For larger organizations managing compliance at scale.",
    features: {
      assessments: "100 assessments / month",
      policies: "200 policy generations / month",
      evidence: "2,000 evidence items",
      members: "15 members",
      pdf: true,
    },
    cta: "Start with Team",
    highlighted: false,
  },
];

const featureRows = [
  { key: "assessments" as const, label: "Assessments" },
  { key: "policies" as const, label: "Policy generations" },
  { key: "evidence" as const, label: "Evidence items" },
  { key: "members" as const, label: "Team members" },
  { key: "pdf" as const, label: "PDF export" },
];

export default function PricingPage() {
  return (
    <div className="py-16">
      {/* Header */}
      <div className="mx-auto max-w-4xl text-center px-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start free and upgrade as your compliance needs grow. No hidden fees.
        </p>
      </div>

      {/* Plan cards */}
      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col rounded-xl border p-6 ${
              plan.highlighted
                ? "border-primary ring-2 ring-primary/20"
                : "border-border"
            }`}
          >
            {plan.highlighted && (
              <span className="mb-3 inline-flex self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Most popular
              </span>
            )}
            <h2 className="text-xl font-bold">{plan.name}</h2>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight">
                {plan.price}
              </span>
              {plan.period && (
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              )}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {plan.description}
            </p>

            <ul className="mt-6 flex-1 space-y-3">
              {featureRows.map((row) => {
                const value = plan.features[row.key];
                const isBool = typeof value === "boolean";
                return (
                  <li key={row.key} className="flex items-start gap-2 text-sm">
                    {isBool ? (
                      value ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
                      )
                    ) : (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    )}
                    <span className={isBool && !value ? "text-muted-foreground" : ""}>
                      {isBool ? row.label : value}
                    </span>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/signup"
              className={`mt-8 block rounded-md px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                plan.highlighted
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "border border-border hover:bg-muted"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="mx-auto mt-20 max-w-6xl px-6">
        <h2 className="text-center text-2xl font-bold">Feature comparison</h2>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4 text-left font-medium text-muted-foreground">
                  Feature
                </th>
                {plans.map((p) => (
                  <th
                    key={p.name}
                    className="px-4 py-3 text-center font-semibold"
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureRows.map((row) => (
                <tr key={row.key} className="border-b border-border/50">
                  <td className="py-3 pr-4 font-medium">{row.label}</td>
                  {plans.map((plan) => {
                    const value = plan.features[row.key];
                    return (
                      <td key={plan.name} className="px-4 py-3 text-center">
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="mx-auto h-4 w-4 text-green-600" />
                          ) : (
                            <X className="mx-auto h-4 w-4 text-gray-300" />
                          )
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

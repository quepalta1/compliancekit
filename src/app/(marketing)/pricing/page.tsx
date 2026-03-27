import Link from "next/link";
import { Check, X } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    features: [
      { text: "1 assessment / month", included: true },
      { text: "1 policy generation / month", included: true },
      { text: "25 evidence items", included: true },
      { text: "1 team member", included: true },
      { text: "PDF export", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "€49",
    period: "/mo",
    description: "For small businesses getting compliant.",
    features: [
      { text: "5 assessments / month", included: true },
      { text: "10 policy generations / month", included: true },
      { text: "100 evidence items", included: true },
      { text: "1 team member", included: true },
      { text: "PDF export", included: true },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "€149",
    period: "/mo",
    description: "For growing teams with serious compliance needs.",
    features: [
      { text: "25 assessments / month", included: true },
      { text: "50 policy generations / month", included: true },
      { text: "500 evidence items", included: true },
      { text: "5 team members", included: true },
      { text: "PDF export", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Team",
    price: "€249",
    period: "/mo",
    description: "For larger organizations managing compliance at scale.",
    features: [
      { text: "100 assessments / month", included: true },
      { text: "200 policy generations / month", included: true },
      { text: "2,000 evidence items", included: true },
      { text: "15 team members", included: true },
      { text: "PDF export", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Get Started",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be prorated for the remainder of the billing cycle. When downgrading, the change takes effect at the end of your current billing period.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer:
      "All paid plans come with a 14-day free trial. No credit card required to start. You'll only be charged when the trial ends and you decide to continue.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Your data remains accessible for 30 days after cancellation. You can export all your assessments, policies, and evidence during this period. After 30 days, data is permanently deleted.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer:
      "Yes, annual billing comes with a 20% discount on all paid plans. Contact our sales team for custom enterprise pricing if you have more than 15 team members.",
  },
];

export default function PricingPage() {
  return (
    <div className="py-16 sm:py-24">
      {/* Header */}
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs">
          Pricing
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start free and upgrade as your compliance needs grow. No hidden fees,
          no surprises.
        </p>
      </div>

      {/* Plan cards */}
      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col bg-white shadow-sm transition-shadow hover:shadow-md ${
              plan.highlighted
                ? "border-[#0369A1] ring-2 ring-[#0369A1]/20"
                : "border-border/50"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#0369A1] px-3 py-1 text-xs text-white">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-[#0F172A]">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </div>
              <CardDescription className="mt-2">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature.text}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    {feature.included ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0369A1]" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                    )}
                    <span
                      className={
                        feature.included ? "" : "text-muted-foreground"
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="mt-8 block">
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-[#0369A1] text-white hover:bg-[#0369A1]/90"
                      : ""
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mx-auto mt-24 max-w-3xl px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-[#0F172A]">
          Frequently asked questions
        </h2>
        <p className="mt-3 text-center text-muted-foreground">
          Everything you need to know about ComplianceKit pricing.
        </p>
        <div className="mt-10 space-y-6">
          {faqs.map((faq) => (
            <Card key={faq.question} className="border-border/50 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

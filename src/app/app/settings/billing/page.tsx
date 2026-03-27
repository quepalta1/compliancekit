import { getCurrentOrganization } from "@/server/queries/organization";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  CreditCard,
  Check,
} from "lucide-react";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import { ManageBillingButton } from "@/components/billing/manage-billing-button";
import { BillingBanner } from "@/components/billing/billing-banner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const planHighlights: Record<
  string,
  { price: string; features: string[]; recommended?: boolean }
> = {
  free: {
    price: "Free",
    features: [
      "1 organization",
      "Basic assessment",
      "Up to 2 members",
      "Community support",
    ],
  },
  starter: {
    price: "\u20ac49/mo",
    features: [
      "1 organization",
      "Full assessments",
      "Policy generation",
      "Up to 5 members",
      "Email support",
    ],
  },
  pro: {
    price: "\u20ac149/mo",
    features: [
      "3 organizations",
      "Full assessments",
      "Policy generation",
      "Evidence management",
      "Up to 15 members",
      "Priority support",
    ],
    recommended: true,
  },
  team: {
    price: "\u20ac249/mo",
    features: [
      "Unlimited organizations",
      "Full assessments",
      "Policy generation",
      "Evidence management",
      "Unlimited members",
      "Dedicated support",
      "Custom integrations",
    ],
  },
};

interface BillingPageProps {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const params = await searchParams;
  const ctx = await getCurrentOrganization();

  if (!ctx) {
    redirect("/app/create-org");
  }

  const supabase = await createClient();

  // Fetch subscription for current org
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("organization_id", ctx.organization.id)
    .limit(1)
    .maybeSingle();

  // Fetch all available plans
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .order("price_eur", { ascending: true });

  const currentPlan = subscription?.plans as {
    id: string;
    code: string;
    name: string;
    price_eur: number;
  } | null;

  const hasStripeCustomer = !!subscription?.stripe_customer_id;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your subscription and billing details
      </p>

      {params.success === "true" && (
        <BillingBanner
          variant="success"
          message="Your subscription has been activated. Thank you!"
        />
      )}

      {params.canceled === "true" && (
        <BillingBanner
          variant="info"
          message="Checkout was canceled. No changes were made to your subscription."
        />
      )}

      {/* Current Plan */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <CreditCard className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>{currentPlan?.name ?? "Free"} plan</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </p>
              <p className="mt-1">
                <Badge
                  variant="secondary"
                  className={
                    subscription?.status === "active"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : subscription?.status === "trialing"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : ""
                  }
                >
                  {subscription?.status ?? "active"}
                </Badge>
              </p>
            </div>
            {subscription?.current_period_start && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Period Start
                </p>
                <p className="mt-1 text-sm">
                  {new Date(
                    subscription.current_period_start,
                  ).toLocaleDateString()}
                </p>
              </div>
            )}
            {subscription?.current_period_end && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Period End
                </p>
                <p className="mt-1 text-sm">
                  {new Date(
                    subscription.current_period_end,
                  ).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {subscription?.cancel_at_period_end && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Your subscription will be cancelled at the end of the current
              billing period.
            </div>
          )}

          <Separator className="my-4" />

          <div>
            {hasStripeCustomer ? (
              <ManageBillingButton />
            ) : (
              <p className="text-sm text-muted-foreground">
                Subscribe to a paid plan to access billing management.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Grid */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">
          Available Plans
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(plans ?? []).map((plan: any) => {
            const highlights = planHighlights[plan.code] ?? {
              price: `\u20ac${plan.price_eur}/mo`,
              features: [],
            };
            const isCurrent = currentPlan?.id === plan.id;
            const isFree = plan.code === "free";

            return (
              <Card
                key={plan.id}
                className={
                  highlights.recommended
                    ? "border-primary ring-1 ring-primary relative"
                    : ""
                }
              >
                {highlights.recommended && (
                  <Badge className="absolute -top-2.5 left-4">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <p className="text-2xl font-bold">
                    {highlights.price}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-5">
                    {highlights.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 text-[#16a34a] shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div>
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : isFree ? (
                      <Button variant="outline" className="w-full" disabled>
                        Default
                      </Button>
                    ) : (
                      <UpgradeButton planCode={plan.code} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

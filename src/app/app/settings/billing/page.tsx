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
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
      <p className="mt-1 text-sm text-gray-500">
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
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <CreditCard className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Current Plan
            </h2>
            <p className="text-sm text-gray-500">
              {currentPlan?.name ?? "Free"} plan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </p>
            <p className="mt-1 text-sm text-gray-900">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  subscription?.status === "active"
                    ? "bg-green-100 text-green-700"
                    : subscription?.status === "trialing"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {subscription?.status ?? "active"}
              </span>
            </p>
          </div>
          {subscription?.current_period_start && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period Start
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(
                  subscription.current_period_start,
                ).toLocaleDateString()}
              </p>
            </div>
          )}
          {subscription?.current_period_end && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period End
              </p>
              <p className="mt-1 text-sm text-gray-900">
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

        <div className="mt-4 pt-4 border-t border-gray-100">
          {hasStripeCustomer ? (
            <ManageBillingButton />
          ) : (
            <p className="text-sm text-gray-400">
              Subscribe to a paid plan to access billing management.
            </p>
          )}
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
              <div
                key={plan.id}
                className={`relative rounded-lg border bg-white p-5 ${
                  highlights.recommended
                    ? "border-blue-500 ring-1 ring-blue-500"
                    : "border-gray-200"
                }`}
              >
                {highlights.recommended && (
                  <span className="absolute -top-2.5 left-4 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-medium text-white">
                    Recommended
                  </span>
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {plan.name}
                </h3>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {highlights.price}
                </p>
                <ul className="mt-4 space-y-2">
                  {highlights.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  {isCurrent ? (
                    <span className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-500">
                      Current Plan
                    </span>
                  ) : isFree ? (
                    <span className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-400">
                      Default
                    </span>
                  ) : (
                    <UpgradeButton planCode={plan.code} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

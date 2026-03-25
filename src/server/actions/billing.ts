"use server";

import { getCurrentOrganization } from "@/server/queries/organization";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/billing/stripe";

const PLAN_PRICE_MAP: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  team: process.env.STRIPE_PRICE_TEAM,
};

export async function createCheckoutSession(
  planCode: string,
): Promise<{ url: string } | { error: string }> {
  const ctx = await getCurrentOrganization();

  if (!ctx) {
    return { error: "You must be logged in with an active organization." };
  }

  const priceId = PLAN_PRICE_MAP[planCode];

  if (!priceId) {
    return { error: `No Stripe price configured for plan: ${planCode}` };
  }

  const supabase = await createClient();
  const stripe = getStripe();

  // Get existing subscription to check for stripe_customer_id
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("organization_id", ctx.organization.id)
    .limit(1)
    .maybeSingle();

  let stripeCustomerId = subscription?.stripe_customer_id;

  // Create Stripe customer if we don't have one yet
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: ctx.user.email ?? undefined,
      metadata: {
        organization_id: ctx.organization.id,
        organization_name: ctx.organization.name,
      },
    });
    stripeCustomerId = customer.id;

    // Persist customer ID so we don't create duplicates
    if (subscription) {
      await supabase
        .from("subscriptions")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("organization_id", ctx.organization.id);
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/app/settings/billing?success=true`,
    cancel_url: `${appUrl}/app/settings/billing?canceled=true`,
    metadata: {
      organization_id: ctx.organization.id,
      plan_code: planCode,
    },
  });

  if (!session.url) {
    return { error: "Stripe did not return a checkout URL." };
  }

  return { url: session.url };
}

export async function createBillingPortalSession(): Promise<
  { url: string } | { error: string }
> {
  const ctx = await getCurrentOrganization();

  if (!ctx) {
    return { error: "You must be logged in with an active organization." };
  }

  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("organization_id", ctx.organization.id)
    .limit(1)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) {
    return {
      error: "No billing account found. Please subscribe to a plan first.",
    };
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${appUrl}/app/settings/billing`,
  });

  return { url: session.url };
}

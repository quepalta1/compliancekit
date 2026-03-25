import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/billing/stripe";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Map Stripe price IDs back to plan codes so we can update the plan_id
 * in our subscriptions table when checkout completes.
 */
function getStripePriceToPlanCodeMap(): Record<string, string> {
  const map: Record<string, string> = {};

  if (process.env.STRIPE_PRICE_STARTER) {
    map[process.env.STRIPE_PRICE_STARTER] = "starter";
  }
  if (process.env.STRIPE_PRICE_PRO) {
    map[process.env.STRIPE_PRICE_PRO] = "pro";
  }
  if (process.env.STRIPE_PRICE_TEAM) {
    map[process.env.STRIPE_PRICE_TEAM] = "team";
  }

  return map;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe-webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  console.log(`[stripe-webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log(
          `[stripe-webhook] Checkout completed for customer ${session.customer}`,
        );

        if (session.subscription && session.metadata?.organization_id) {
          // Resolve the plan_id from the Stripe price
          let planId: string | null = null;
          const stripe = getStripe();

          try {
            const stripeSubscription = await stripe.subscriptions.retrieve(
              session.subscription as string,
            );
            const priceId = stripeSubscription.items.data[0]?.price?.id;

            if (priceId) {
              const priceToCode = getStripePriceToPlanCodeMap();
              const planCode = priceToCode[priceId];

              if (planCode) {
                const { data: plan } = await supabase
                  .from("plans")
                  .select("id")
                  .eq("code", planCode)
                  .single();

                if (plan) {
                  planId = plan.id;
                }
              }
            }
          } catch (err) {
            console.error(
              "[stripe-webhook] Error resolving plan from price:",
              err instanceof Error ? err.message : err,
            );
          }

          const updatePayload: Record<string, unknown> = {
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            status: "active",
            updated_at: new Date().toISOString(),
          };

          if (planId) {
            updatePayload.plan_id = planId;
          }

          const { error } = await supabase
            .from("subscriptions")
            .update(updatePayload)
            .eq("organization_id", session.metadata.organization_id);

          if (error) {
            console.error(
              "[stripe-webhook] Error updating subscription:",
              error.message,
            );
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        console.log(
          `[stripe-webhook] Subscription updated: ${subscription.id} -> ${subscription.status}`,
        );

        // Check if the price changed and update plan_id accordingly
        let planId: string | null = null;
        const priceId = subscription.items.data[0]?.price?.id;

        if (priceId) {
          const priceToCode = getStripePriceToPlanCodeMap();
          const planCode = priceToCode[priceId];

          if (planCode) {
            const { data: plan } = await supabase
              .from("plans")
              .select("id")
              .eq("code", planCode)
              .single();

            if (plan) {
              planId = plan.id;
            }
          }
        }

        const updatePayload: Record<string, unknown> = {
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_start: new Date(
            subscription.current_period_start * 1000,
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000,
          ).toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (planId) {
          updatePayload.plan_id = planId;
        }

        const { error } = await supabase
          .from("subscriptions")
          .update(updatePayload)
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error(
            "[stripe-webhook] Error updating subscription:",
            error.message,
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        console.log(
          `[stripe-webhook] Subscription deleted: ${subscription.id}`,
        );

        // Revert to the free plan
        let freePlanId: string | null = null;
        const { data: freePlan } = await supabase
          .from("plans")
          .select("id")
          .eq("code", "free")
          .single();

        if (freePlan) {
          freePlanId = freePlan.id;
        }

        const updatePayload: Record<string, unknown> = {
          status: "canceled",
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        };

        if (freePlanId) {
          updatePayload.plan_id = freePlanId;
        }

        const { error } = await supabase
          .from("subscriptions")
          .update(updatePayload)
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error(
            "[stripe-webhook] Error updating subscription:",
            error.message,
          );
        }
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[stripe-webhook] Error processing ${event.type}:`, message);
    return NextResponse.json(
      { error: `Error processing webhook: ${message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

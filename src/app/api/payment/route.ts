import { EventName, Environment, Paddle } from "@paddle/paddle-node-sdk";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const paddle = new Paddle(process.env.PADDLE_SECRET_TOKEN!, {
  environment: Environment.sandbox,
});

// Create Supabase admin client
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase admin credentials.");
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};

// Centralized helper function to get credits for any tier
const getCreditsForTier = (tier: string | undefined): number => {
  switch (tier) {
    case "free":
      return 100;
    case "basic":
      return 1000;
    case "pro":
      return 2500;
    case "creator":
      return 5000;
    default:
      return 0;
  }
};

export async function POST(req: Request) {
  const signature = (req.headers.get("paddle-signature") as string) || "";
  const rawRequestBody = (await req.text()) || "";
  const secretKey = process.env.WEBHOOK_SECRET_KEY || "";

  try {
    if (!signature || !rawRequestBody || !secretKey) {
      console.log("Signature missing or invalid request body.");
      return new Response("Webhook Error: Invalid request", { status: 400 });
    }

    const eventData = await paddle.webhooks.unmarshal(rawRequestBody, secretKey, signature);

    const supabase = getSupabaseAdmin();

    switch (eventData.eventType) {
      // CORRECT: Grouped SubscriptionActivated and SubscriptionUpdated to share logic
      case EventName.SubscriptionActivated:
      case EventName.SubscriptionUpdated: {
        console.log(`Subscription ${eventData.data.id} was ${eventData.eventType}.`);

        const item = eventData.data.items[0];
        const product = item.product;

        // A robust way to get the plan ID
        const tier =
          (product?.customData as { plan_id?: string })?.plan_id || product?.name?.toLowerCase();

        const newCredits = getCreditsForTier(tier);

        const { error } = await supabase
          .from("profiles")
          .update({
            paddle_subscription_id: eventData.data.id,
            subscription_tier: tier,
            subscription_type: item.price?.billingCycle?.interval,
            subscription_credits: newCredits,
            credits_renewal_date: eventData.data.nextBilledAt,
            subscription_status: eventData.data.status,
            updated_at: new Date().toISOString(),
          })
          .eq("paddle_customer_id", eventData.data.customerId);

        if (error) {
          console.error(`Error on ${eventData.eventType}:`, error);
        } else {
          console.log(
            `Successfully processed ${eventData.eventType} for sub ${eventData.data.id}.`,
          );
        }
        break;
      }

      case EventName.SubscriptionCanceled: {
        console.log(`Subscription ${eventData.data.id} was canceled. Downgrading to free tier.`);

        const nextRenewalDate = new Date();
        nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);

        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_tier: "free",
            subscription_status: "active",
            // Using the helper function is cleaner than hardcoding '100'
            subscription_credits: getCreditsForTier("free"),
            credits_renewal_date: nextRenewalDate.toISOString(),
            paddle_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("paddle_subscription_id", eventData.data.id);

        if (error) {
          console.error("Error downgrading user to free tier:", error.message);
        } else {
          console.log(`Successfully downgraded user from sub ${eventData.data.id}.`);
        }
        break;
      }

      case EventName.CustomerCreated: {
        console.log(`Customer ${eventData.data.id} was created.`);

        const { error } = await supabase
          .from("profiles")
          .update({
            paddle_customer_id: eventData.data.id,
            updated_at: new Date().toISOString(),
          })
          .eq("email", eventData.data.email);

        if (error) {
          console.error("Error linking Paddle customer:", error);
        } else {
          console.log(`Successfully linked customer ${eventData.data.id}.`);
        }
        break;
      }

      // Placeholder for bonus credit purchases
      case EventName.TransactionCompleted: {
        // This event fires for every payment, including renewals.
        // You need to check if this was a one-time product purchase.
        // const customData = eventData.data.items[0].price?.customData;
        // if (customData?.type === 'bonus_credit_purchase') {
        //     console.log('Bonus credit purchase detected. Add logic here.');
        //     // Add bonus credits to the user's profile
        // } else {
        //     console.log(`Transaction ${eventData.data.id} was paid (likely a renewal).`);
        // }
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${eventData.eventType}`);
    }
  } catch (e: any) {
    console.error("Webhook handler error:", e.message);
    return new Response(`Webhook Error: ${e.message}`, { status: 400 });
  }

  return NextResponse.json({ received: true });
}

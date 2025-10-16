// src/app/api/webhooks/dodo/route.ts

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";

import { dodoClient } from "@/src/lib/dodoPayments";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, webhook-id, webhook-signature, webhook-timestamp",
};

// Create Supabase admin client
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase admin credentials.");
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};

export async function POST(req: NextRequest) {
  const dodoWebhookSecret = process.env.DODO_WEBHOOK_SECRET;
  if (!dodoWebhookSecret) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // ✅ Read raw body correctly
  const rawBody = await req.text(); // <-- IMPORTANT

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const webhookHeaders = {
    "webhook-id": req.headers.get("webhook-id") || "",
    "webhook-signature": req.headers.get("webhook-signature") || "",
    "webhook-timestamp": req.headers.get("webhook-timestamp") || "",
  };

  const webhook = new Webhook(dodoWebhookSecret);

  try {
    await webhook.verify(rawBody, webhookHeaders);
  } catch (error: any) {
    console.error("Webhook verification failed:", error.message);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400, headers: corsHeaders },
    );
  }

  console.info(`✅ Received and verified '${event.type}' event.`);

  const supabase = getSupabaseAdmin();

  try {
    switch (event.type) {
      // payment events
      case "payment.succeeded":
      case "payment.failed":
      case "payment.processing":
      case "payment.cancelled":
        await managePayment(event, supabase);
        break;

      // subscription events
      case "subscription.active":
      case "subscription.plan_changed":
        await manageSubscription(event, supabase);
        // This is the new logic to update the user's profile with tier and credits
        await activateOrUpdateSubscription(
          {
            dodoCustomerId: event.data.customer.customer_id,
            subscription: event.data,
          },
          supabase,
        );
        break;

      case "subscription.on_hold":
        await manageSubscription(event, supabase);
        break;

      case "subscription.renewed":
        await manageSubscription(event, supabase);
        await renewSubscriptionCredits(
          {
            subscription: event.data,
          },
          supabase,
        );
        break;

      case "subscription.cancelled":
        await markSubscriptionForCancellation(event, supabase);
        break;

      case "subscription.expired":
      case "subscription.failed":
        await manageSubscription(event, supabase);
        // This is the new logic to downgrade the user
        await downgradeUserPlan(
          {
            dodoCustomerId: event.data.customer.customer_id,
          },
          supabase,
        );
        break;

      default:
        console.warn(`⚠️ Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error(`Error processing webhook event '${event.type}':`, error.message);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500, headers: corsHeaders },
    );
  }

  return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });
}

// --- HELPER FUNCTIONS ---

// Maps and upserts payment data
async function managePayment(event: any, supabase: any) {
  const data = {
    payment_id: event.data.payment_id,
    status: event.data.status,
    total_amount: event.data.total_amount,
    currency: event.data.currency,
    payment_method: event.data.payment_method,
    payment_method_type: event.data.payment_method_type,
    customer_id: event.data.customer.customer_id,
    customer_name: event.data.customer.name,
    customer_email: event.data.customer.email,
    created_at: event.data.created_at,
    subscription_id: event.data.subscription_id,
    brand_id: event.data.brand_id,
    metadata: event.data.metadata,
    webhook_data: event,
    billing: event.data.billing,
    business_id: event.data.business_id,
    card_issuing_country: event.data.card_issuing_country,
    card_last_four: event.data.card_last_four,
    card_network: event.data.card_network,
    card_type: event.data.card_type,
    discount_id: event.data.discount_id,
    disputes: event.data.disputes,
    error_code: event.data.error_code,
    error_message: event.data.error_message,
    payment_link: event.data.payment_link,
    product_cart: event.data.product_cart,
    refunds: event.data.refunds,
    settlement_amount: event.data.settlement_amount,
    settlement_currency: event.data.settlement_currency,
    settlement_tax: event.data.settlement_tax,
    tax: event.data.tax,
    updated_at: event.data.updated_at,
  };

  const { error } = await supabase.from("payments").upsert(data, {
    onConflict: "payment_id",
  });

  if (error) throw new Error(`Supabase payment upsert error: ${error.message}`);
  console.log(`Payment ${data.payment_id} upserted successfully.`);
}

// Maps and upserts subscription data
async function manageSubscription(event: any, supabase: any) {
  const data = {
    subscription_id: event.data.subscription_id,
    addons: event.data.addons,
    billing: event.data.billing,
    cancel_at_next_billing_date: event.data.cancel_at_next_billing_date,
    cancelled_at: event.data.cancelled_at,
    created_at: event.data.created_at,
    currency: event.data.currency,
    customer_email: event.data.customer.email,
    customer_name: event.data.customer.name,
    customer_id: event.data.customer.customer_id,
    discount_id: event.data.discount_id,
    metadata: event.data.metadata,
    next_billing_date: event.data.next_billing_date,
    on_demand: event.data.on_demand,
    payment_frequency_count: event.data.payment_frequency_count,
    payment_period_interval: event.data.payment_frequency_interval,
    previous_billing_date: event.data.previous_billing_date,
    product_id: event.data.product_id,
    quantity: event.data.quantity,
    recurring_pre_tax_amount: event.data.recurring_pre_tax_amount,
    status: event.data.status,
    subscription_period_count: event.data.subscription_period_count,
    subscription_period_interval: event.data.subscription_period_interval,
    tax_inclusive: event.data.tax_inclusive,
    trial_period_days: event.data.trial_period_days,
  };

  const { error } = await supabase.from("subscriptions").upsert(data, {
    onConflict: "subscription_id",
  });

  if (error) throw new Error(`Supabase subscription upsert error: ${error.message}`);
  console.log(`Subscription ${data.subscription_id} upserted successfully.`);
}

/**
 * NEW: Fetches product details and updates the user's profile with the correct tier,
 * credits, and subscription status.
 */
async function activateOrUpdateSubscription(
  props: { dodoCustomerId: string; subscription: any },
  supabase: any,
) {
  const { dodoCustomerId, subscription } = props;

  // --- NEW: Fetch the user's current state from your database ---
  const { data: currentProfile, error: profileError } = await supabase
    .from("profiles")
    .select("subscription_credits, current_subscription_id")
    .eq("customer_id", dodoCustomerId)
    .single();

  if (profileError || !currentProfile) {
    throw new Error(`Profile for customer ${dodoCustomerId} not found.`);
  }

  const { data: oldSubscription, error: oldSubError } = await supabase
    .from("subscriptions")
    .select("product_id")
    .eq("subscription_id", currentProfile.current_subscription_id)
    .single();

  // --- Fetch product details for NEW and OLD plans ---
  const newProduct = await dodoClient.products.retrieve(subscription.product_id);
  if (!newProduct) {
    throw new Error(`New product with ID ${subscription.product_id} not found.`);
  }

  let oldPlanCredits = 0;
  if (oldSubscription && !oldSubError) {
    const oldProduct = await dodoClient.products.retrieve(oldSubscription.product_id);
    oldPlanCredits = oldProduct?.metadata?.credit ? parseInt(oldProduct.metadata.credit, 10) : 0;
  }

  const newPlanCredits = newProduct.metadata?.credit ? parseInt(newProduct.metadata.credit, 10) : 0;

  // --- NEW: Calculate the credit adjustment ---
  const creditDifference = newPlanCredits - oldPlanCredits;
  const currentCredits = currentProfile.subscription_credits || 0;
  // Ensure credits don't go below zero
  const updatedCredits = Math.max(0, currentCredits + creditDifference);

  // --- Prepare the final data for the update ---
  const profileUpdateData = {
    current_subscription_id: subscription.subscription_id,
    subscription_status: "active",
    subscription_tier: newProduct.name,
    subscription_type: subscription.price_detail?.payment_frequency_interval.toLowerCase() ?? null,
    subscription_credits: updatedCredits, // Use the correctly adjusted credit amount
    credits_renewal_date: subscription.next_billing_date,
  };

  // --- Update the user's profile ---
  const { error: updateError } = await supabase
    .from("profiles")
    .update(profileUpdateData)
    .eq("customer_id", dodoCustomerId);

  if (updateError) throw new Error(`Supabase profile update error: ${updateError.message}`);

  console.log(
    `Profile updated for customer ${dodoCustomerId}. New credit balance: ${updatedCredits}.`,
  );
}

/**
 * Handles subscription renewals by fetching the latest product data and resetting credits.
 */
async function renewSubscriptionCredits(props: { subscription: any }, supabase: any) {
  const { subscription } = props;

  // 1. Fetch the product details to get the credit amount from metadata
  const product = await dodoClient.products.retrieve(subscription.product_id);
  if (!product) {
    throw new Error(`Renewal failed: Product with ID ${subscription.product_id} not found.`);
  }

  // 2. Prepare the data for the 'profiles' table update
  const profileUpdateData = {
    // Reset the credits to the amount defined in the product's metadata
    subscription_credits: product.metadata?.credit ? parseInt(product.metadata.credit, 10) : 0,
    // Update the renewal date to the *next* billing date provided in the webhook
    credits_renewal_date: subscription.next_billing_date,
    // Ensure the status is active
    subscription_status: "active",
  };

  // 3. Update the user's profile based on their Dodo Customer ID
  const { error } = await supabase
    .from("profiles")
    .update(profileUpdateData)
    .eq("customer_id", subscription.customer.customer_id);

  if (error) throw new Error(`Supabase profile update error on renewal: ${error.message}`);
  console.log(
    `Credits renewed for customer ${subscription.customer.customer_id} for tier '${product.name}'.`,
  );
}

/**
 * NEW: Updates the user's profile to a 'free' or 'inactive' state.
 */
async function downgradeUserPlan(props: { dodoCustomerId: string }, supabase: any) {
  const profileUpdateData = {
    current_subscription_id: null,
    subscription_status: "inactive",
    subscription_tier: "free", // Default tier from your schema
    subscription_type: null,
    subscription_credits: 100, // Default credits from your schema
    credits_renewal_date: null,
  };

  const { error } = await supabase
    .from("profiles")
    .update(profileUpdateData)
    .eq("customer_id", props.dodoCustomerId); // Using 'customer_id'

  if (error) throw new Error(`Supabase profile downgrade error: ${error.message}`);
  console.log(`Profile downgraded for customer ${props.dodoCustomerId}.`);
}

// In src/app/api/webhooks/dodo/route.ts

async function markSubscriptionForCancellation(event: any, supabase: any) {
  console.log("Cancelled");
  const data = {
    // We only need to update the flags related to cancellation
    cancel_at_next_billing_date: event.data.cancel_at_next_billing_date,
    cancelled_at: event.data.cancelled_at,
  };

  const { error } = await supabase
    .from("subscriptions")
    .update(data)
    .eq("subscription_id", event.data.subscription_id);

  if (error)
    throw new Error(`Supabase subscription update error for cancellation: ${error.message}`);

  console.log(`Subscription ${event.data.subscription_id} marked for cancellation at period end.`);
}

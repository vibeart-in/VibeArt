"use client";

import { User } from "@supabase/supabase-js";
import { ProductListResponse } from "dodopayments/resources/index.mjs";
import { redirect } from "next/navigation";
import { toast } from "sonner";

import { changePlan } from "@/src/actions/subscription/changePlan";

import { Subscription, UserDetails } from "../../user/dashboard/dashboard";
import { UpdatePlanDialog } from "../../user/dashboard/updatePlanDialog";

export function PricingHero(props: {
  products: ProductListResponse[];
  user: User | null;
  userSubscription: {
    subscription: Subscription | null;
    user: UserDetails;
  } | null;
}) {
  const handlePlanChange = async (productId: string) => {
    if (props.user && props.userSubscription) {
      if (props.userSubscription.user.current_subscription_id) {
        const res = await changePlan({
          subscriptionId: props.userSubscription.user.current_subscription_id,
          productId,
        });

        if (!res.success) {
          toast.error(res.error);
          return;
        }

        toast.success("Plan changed successfully");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        window.location.reload();
        return;
      }

      try {
        // Construct the URL to your checkout API endpoint
        const url = new URL(`${window.location.origin}/api/checkout`);
        url.searchParams.set("email", props.user.email! ?? "");
        url.searchParams.set("fullName", props.user.user_metadata.name ?? "");
        url.searchParams.set("disableEmail", "true");
        url.searchParams.set("productId", productId);

        // Fetch the checkout URL from your backend
        const response = await fetch(url.toString());
        const data = await response.json();

        // Redirect the user to the Dodo Payments checkout page
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          console.error("Checkout URL not found in the response.");
          toast.error("An error occurred while trying to redirect to payment.");
        }
      } catch (error) {
        console.error("Checkout error:", error);
        toast.error("Failed to start checkout process");
      }
    } else {
      redirect("/auth/signup");
    }
  };

  return (
    <div className="mx-auto max-w-[80vw]">
      <UpdatePlanDialog
        currentPlan={props.userSubscription ? props.userSubscription.subscription : null}
        onPlanChange={handlePlanChange}
        triggerText={
          props.userSubscription?.user.current_subscription_id ? "Change Plan" : "Upgrade Plan"
        }
        products={props.products}
        isDialog={false}
        user={props.user}
        title="Our Best Pricing"
      />
    </div>
  );
}

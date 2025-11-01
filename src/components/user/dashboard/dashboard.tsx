"use client";

import { UserIcon } from "@phosphor-icons/react";
import { User } from "@supabase/supabase-js";
import { ProductListResponse } from "dodopayments/resources/index.mjs";
import { CreditCardIcon, ReceiptTextIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { cancelSubscription } from "@/src/actions/subscription/cancelSubscription";
import { changePlan } from "@/src/actions/subscription/changePlan";
import { cn } from "@/src/lib/utils";
import { Database } from "@/supabase/database.types";

import { AccountManagement } from "./AccountManagement";
import { InvoiceHistory } from "./invoiceHistory";
import { SubscriptionManagement } from "./subscriptionManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

// A single row from your 'subscriptions' table
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

// A single row from your public 'users' table
export type UserDetails = Database["public"]["Tables"]["profiles"]["Row"];

// A single row from your 'payments' table
type Invoice = Database["public"]["Tables"]["payments"]["Row"];

export function Dashboard(props: {
  products: ProductListResponse[];
  user: User;
  userSubscription: {
    subscription: Subscription | null;
    user: UserDetails;
  };
  invoices: Invoice[];
}) {
  const [active, setActive] = useState("manage-subscription");

  const tabsListRef = useRef<HTMLDivElement>(null);

  const components = [
    { id: "manage-subscription", label: "Billing", icon: CreditCardIcon },
    { id: "payments", label: "Invoices", icon: ReceiptTextIcon },
    { id: "account", label: "Account", icon: UserIcon },
  ];

  const handleTransition = (targetComponent?: string) => {
    const currentIndex = components.findIndex((comp) => comp.id === active);
    let nextComponent;

    if (targetComponent) {
      nextComponent = targetComponent;
    } else {
      const nextIndex = (currentIndex + 1) % components.length;
      nextComponent = components[nextIndex].id;
    }

    setActive(nextComponent);
  };

  const handleComponentClick = (componentId: string) => {
    if (componentId === active) return;
    handleTransition(componentId);
  };

  const handlePlanChange = async (productId: string) => {
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
  };

  return (
    <div className="relative mx-auto size-full max-w-7xl py-12 md:px-8">
      <div id="components-showcase" className="my-auto mt-5 gap-3">
        <div className="">
          <Tabs value={active} onValueChange={handleComponentClick} className="w-full">
            {/* Centered wrapper for tabs */}
            <div className="relative my-auto flex flex-col items-center gap-2">
              <div className="relative">
                <TabsList
                  ref={tabsListRef}
                  className="relative flex h-auto flex-row gap-2 rounded-2xl border bg-background p-3 md:p-4"
                >
                  {components.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <TabsTrigger
                        key={item.id}
                        value={item.id}
                        className={cn(
                          "flex h-auto flex-row items-center gap-2 px-4 py-3 transition-all duration-200",
                          "whitespace-nowrap rounded-xl border-0 text-sm font-medium",
                          "justify-center hover:bg-muted/50",
                        )}
                      >
                        <IconComponent className="size-5" />
                        <span className="hidden text-sm leading-tight sm:inline">
                          {item.label.split(" ")[0]}
                        </span>
                        <span className="text-sm leading-tight sm:hidden">{item.label}</span>
                      </TabsTrigger>
                    );
                  })}
                  <motion.div
                    className="pointer-events-none absolute rounded-xl bg-white/10"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                    style={{
                      zIndex: 0,
                    }}
                  />
                </TabsList>
              </div>
            </div>

            {/* Centered content container */}
            <div className="mt-6 flex w-full flex-col items-center justify-center">
              <div className="w-full max-w-5xl rounded-2xl">
                <div className="size-full transition-all duration-300 ease-in-out">
                  <TabsContent value="manage-subscription" className="mt-0">
                    <SubscriptionManagement
                      className="mx-auto max-w-2xl"
                      products={props.products}
                      currentPlan={props.userSubscription.subscription}
                      updatePlan={{
                        currentPlan: props.userSubscription.subscription,
                        onPlanChange: handlePlanChange,
                        triggerText: props.userSubscription.user.current_subscription_id
                          ? "Change Plan"
                          : "Upgrade Plan",
                        products: props.products,
                        user: props.user,
                      }}
                      cancelSubscription={{
                        products: props.products,
                        title: "Cancel Subscription",
                        description: "Are you sure you want to cancel your subscription?",
                        leftPanelImageUrl:
                          "https://img.freepik.com/free-vector/abstract-paper-cut-shape-wave-background_474888-4649.jpg?semt=ais_hybrid&w=740&q=80",
                        plan: props.userSubscription.subscription,
                        warningTitle: "You will lose access to your credits",
                        warningText:
                          "If you cancel your subscription, you will lose access to your credits.",
                        onCancel: async (planId) => {
                          if (props.userSubscription.subscription) {
                            await cancelSubscription({
                              subscriptionId: props.userSubscription.subscription.subscription_id,
                            });
                          }
                          toast.success("Subscription cancelled successfully");
                          window.location.reload();
                          return;
                        },
                        onKeepSubscription: async (planId) => {
                          console.log("keep subscription", planId);
                        },
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="payments" className="mt-0">
                    <InvoiceHistory invoices={props.invoices} />
                  </TabsContent>

                  <TabsContent value="account" className="mt-0">
                    <AccountManagement
                      className="mx-auto max-w-2xl"
                      user={props.user}
                      userSubscription={props.userSubscription}
                    />
                  </TabsContent>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

"use client";

import { ProductListResponse } from "dodopayments/resources/index.mjs";
import { Calendar, CheckCircle, CreditCard } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { freePlan } from "@/src/lib/config/plans";
import { cn } from "@/src/lib/utils";

import {
  CancelSubscriptionDialog,
  type CancelSubscriptionDialogProps,
} from "./cancelSubscriptionDialog";
import { Subscription } from "./dashboard";
import { RestoreSubscriptionDialog } from "./restoreSubscriptionDialog";
import { UpdatePlanDialog, type UpdatePlanDialogProps } from "./updatePlanDialog";
import TailwindBadge from "../../ui/tailwindBadge";

interface SubscriptionManagementProps {
  className?: string;
  currentPlan: Subscription | null;
  cancelSubscription: CancelSubscriptionDialogProps;
  updatePlan: UpdatePlanDialogProps;
  products: ProductListResponse[];
}

export function SubscriptionManagement({
  className,
  currentPlan,
  cancelSubscription,
  updatePlan,
  products,
}: SubscriptionManagementProps) {
  const currentPlanDetails = products.find(
    (product) => product.product_id === currentPlan?.product_id,
  );

  const usage = currentPlanDetails
    ? JSON.parse(currentPlanDetails?.metadata.usage || "[]")
    : freePlan.usage;

  return (
    <div className={cn("w-full text-left", className)}>
      <Card className="">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <div className="rounded-lg bg-primary/10 p-1.5 ring-1 ring-primary/20">
              <CreditCard className="size-4 text-primary sm:size-5" />
            </div>
            Billing
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Manage your current subscription and billing information
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-4 sm:space-y-8 sm:px-6">
          {/* Current Plan Details with highlighted styling */}
          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 p-3 sm:p-4">
            <div className="relative">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                <div className="w-full">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold sm:text-xl">
                        {currentPlanDetails?.name || freePlan.name}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {currentPlan && (
                        <TailwindBadge variant={currentPlan.status === "active" ? "green" : "red"}>
                          {currentPlan.status}
                        </TailwindBadge>
                      )}
                      {currentPlan && currentPlan.cancel_at_next_billing_date && (
                        <TailwindBadge variant={"red"}>Scheduled for cancellation</TailwindBadge>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <p className="relative z-10 text-xs text-muted-foreground sm:text-sm">
                      {currentPlanDetails?.description || freePlan.description}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <UpdatePlanDialog
                      className="mx-0 shadow-lg transition-all duration-200 hover:shadow-xl"
                      {...updatePlan}
                    />

                    {currentPlan && !currentPlan.cancel_at_next_billing_date && (
                      <CancelSubscriptionDialog
                        className="mx-0 shadow-lg transition-all duration-200 hover:shadow-xl"
                        {...cancelSubscription}
                      />
                    )}

                    {currentPlan && currentPlan.cancel_at_next_billing_date && (
                      <RestoreSubscriptionDialog subscriptionId={currentPlan.subscription_id} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {currentPlan && (
            <Separator className="my-4 bg-gradient-to-r from-transparent via-border to-transparent sm:my-6" />
          )}
          {currentPlan && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="flex items-center gap-2 text-base font-medium sm:text-lg">
                <div className="rounded-md bg-muted p-1 ring-1 ring-border/50 sm:p-1.5">
                  <Calendar className="size-3 sm:size-4" />
                </div>
                Billing Information
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="group rounded-lg border border-border/30 bg-gradient-to-b from-muted to-background/10 p-2.5 transition-all duration-200 hover:border-border/60 sm:p-3 md:bg-gradient-to-tr">
                  <span className="mb-1 block text-xs text-muted-foreground sm:text-sm">Price</span>
                  <div className="text-sm font-medium transition-colors duration-200 group-hover:text-primary sm:text-base">
                    {currentPlan.payment_period_interval === "Month"
                      ? `$${Number(currentPlanDetails?.price) / 100} / month`
                      : currentPlan.payment_period_interval === "Year"
                        ? `$${Number(currentPlanDetails?.price) / 100} / year`
                        : `$${Number(currentPlanDetails?.price) / 100}`}
                  </div>
                </div>
                <div className="group rounded-lg border border-border/30 bg-gradient-to-b from-muted to-background/10 p-2.5 transition-all duration-200 hover:border-border/60 sm:p-3 md:bg-gradient-to-tl">
                  <span className="mb-1 block text-xs text-muted-foreground sm:text-sm">
                    {currentPlan.cancel_at_next_billing_date ? "Cancels on" : "Next billing date"}
                  </span>
                  <div className="text-sm font-medium transition-colors duration-200 group-hover:text-primary sm:text-base">
                    {new Date(currentPlan.next_billing_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
          <Separator className="my-4 bg-gradient-to-r from-transparent via-border to-transparent sm:my-6" />
          <ul className="space-y-4">
            {usage.map((feature: string, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="size-4 text-accent" />
                <span className="text-sm sm:text-base">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

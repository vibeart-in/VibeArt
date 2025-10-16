"use client";

import { ProductListResponse } from "dodopayments/resources/index.mjs";
import { Circle, LoaderCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { cn } from "@/src/lib/utils";

import TailwindBadge from "../../ui/tailwindBadge";

export interface CancelSubscriptionDialogProps {
  title: string;
  description: string;
  plan: any | null;
  triggerButtonText?: string;
  leftPanelImageUrl?: string;
  warningTitle?: string;
  warningText?: string;
  keepButtonText?: string;
  continueButtonText?: string;
  finalTitle?: string;
  finalSubtitle?: string;
  finalWarningText?: string;
  goBackButtonText?: string;
  confirmButtonText?: string;
  onCancel: (planId: string) => Promise<void> | void;
  onKeepSubscription?: (planId: string) => Promise<void> | void;
  onDialogClose?: () => void;
  className?: string;
  products: ProductListResponse[];
}

export function CancelSubscriptionDialog({
  title,
  description,
  plan,
  triggerButtonText,
  leftPanelImageUrl,
  warningTitle,
  warningText,
  keepButtonText,
  continueButtonText,
  finalTitle,
  finalSubtitle,
  finalWarningText,
  goBackButtonText,
  confirmButtonText,
  onCancel,
  onKeepSubscription,
  onDialogClose,
  className,
  products,
}: CancelSubscriptionDialogProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentPlanDetails = products.find((product) => product.product_id === plan?.productId);

  const handleContinueCancellation = () => {
    setShowConfirmation(true);
    setError(null);
  };

  const handleConfirmCancellation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (plan) {
        await onCancel(plan.subscriptionId);
      }
      handleDialogClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeepSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (onKeepSubscription && plan) {
        await onKeepSubscription(plan.subscriptionId);
      }
      handleDialogClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to keep subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    setShowConfirmation(false);
    setError(null);
    setIsLoading(false);
    onDialogClose?.();
  };

  const handleGoBack = () => {
    setShowConfirmation(false);
    setError(null);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        handleDialogClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          setIsOpen(true);
        } else {
          handleDialogClose();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="rounded-xl"
          disabled={!!plan?.cancelAtNextBillingDate}
          variant="secondary"
        >
          Cancel Subscription
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "flex flex-col overflow-hidden p-0 text-foreground md:flex-row",
          leftPanelImageUrl ? "" : "sm:max-w-[200px]",
          className,
        )}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogClose
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          onClick={handleDialogClose}
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className={cn("flex flex-col gap-4 px-4 py-6")}>
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h2 className="text-xl font-semibold md:text-2xl">{title}</h2>
            <p className="text-xs text-muted-foreground md:text-sm">{description}</p>
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          {/* Plan Details */}
          {!showConfirmation && (
            <div className="flex flex-col gap-4 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-semibold">{currentPlanDetails?.name} Plan</span>
                  <span className="text-sm text-muted-foreground">Current subscription</span>
                </div>
                <TailwindBadge variant={currentPlanDetails?.price ? "green" : "default"}>
                  {currentPlanDetails?.price
                    ? `$${Number(currentPlanDetails?.price) / 100}`
                    : "Free"}
                </TailwindBadge>
              </div>
              <div className="flex flex-col gap-2">
                {plan &&
                  JSON.parse(currentPlanDetails?.metadata.features || "[]").map(
                    (feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Circle className="size-2 fill-primary text-primary" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ),
                  )}
              </div>
            </div>
          )}

          {/* Warning Section */}
          {!showConfirmation && (warningTitle || warningText) && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              {warningTitle && (
                <h3 className="mb-2 font-semibold text-foreground">{warningTitle}</h3>
              )}
              {warningText && <p className="text-sm text-muted-foreground">{warningText}</p>}
            </div>
          )}
          {/* Action Buttons */}
          {!showConfirmation ? (
            <div className="mt-auto flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1" onClick={handleKeepSubscription} disabled={isLoading}>
                {isLoading ? "Processing..." : keepButtonText || "Keep My Subscription"}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleContinueCancellation}
                disabled={isLoading}
              >
                {continueButtonText || "Continue Cancellation"}
              </Button>
            </div>
          ) : (
            <div className="mt-auto flex flex-col gap-4">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <h3 className="mb-2 font-semibold text-foreground">
                  {finalTitle || "Final Confirmation"}
                </h3>
                <p className="mb-2 text-sm text-muted-foreground">
                  {finalSubtitle || "Are you sure you want to cancel your subscription?"}
                </p>
                <p className="text-sm text-destructive">
                  {finalWarningText ||
                    "This action cannot be undone and you'll lose access to all premium features."}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleGoBack}
                  disabled={isLoading}
                >
                  {goBackButtonText || "Go Back"}
                </Button>
                <Button
                  variant={isLoading ? "secondary" : "destructive"}
                  className="flex-1"
                  onClick={handleConfirmCancellation}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <LoaderCircle className="size-4 animate-spin text-muted-foreground dark:text-muted-foreground" />
                  )}
                  {confirmButtonText || "Yes, Cancel Subscription"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

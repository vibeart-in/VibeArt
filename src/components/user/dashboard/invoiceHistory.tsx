"use client";

import { CalendarDays, CreditCard, Download, ReceiptText } from "lucide-react";
import Image from "next/image";

import { cn } from "@/src/lib/utils";
import { Database } from "@/supabase/database.types";

import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import TailwindBadge from "../../ui/tailwindBadge";

type InvoiceType = Database["public"]["Tables"]["payments"]["Row"];

interface InvoiceHistoryProps {
  className?: string;
  title?: string;
  description?: string;
  invoices: InvoiceType[];
  onDownload?: (invoiceId: string) => void;
}

export function InvoiceHistory({
  className,
  title = "Invoice History",
  description = "Your past invoices and payment receipts.",
  invoices,
  onDownload,
}: InvoiceHistoryProps) {
  if (!invoices) return null;

  function getStatusBadge(status: string) {
    const isSuccess = status === "succeeded";
    return (
      <TailwindBadge variant={isSuccess ? "green" : "red"}>
        {isSuccess ? "Paid" : "Failed"}
      </TailwindBadge>
    );
  }

  function getPaymentMethodLogo(network: string | null) {
    if (!network)
      return (
        <div className="flex h-6 w-10 items-center justify-center rounded bg-gray-200">
          <CreditCard className="size-4 text-gray-600" />
        </div>
      );

    switch (network.toUpperCase()) {
      case "VISA":
        return (
          <Image
            src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/others/visa-white-new-1.png"
            alt="Visa"
            width={32}
            height={32}
          />
        );
      case "MASTERCARD":
      case "MASTER":
        return (
          <Image
            src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/others/Mastercard_new_logo-1200x865.webp"
            alt="Mastercard"
            width={32}
            height={32}
          />
        );
      case "AMEX":
      case "AMERICAN_EXPRESS":
        return (
          <Image
            src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/others/American_Express_logo_(2018).svg"
            alt="Amex"
            width={32}
            height={32}
          />
        );
      default:
        return (
          <div className="flex h-6 w-10 items-center justify-center rounded bg-gray-200">
            <CreditCard className="size-4 text-gray-600" />
          </div>
        );
    }
  }

  return (
    <Card className={cn("mx-auto w-full max-w-2xl", className)}>
      {(title || description) && (
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <div className="rounded-lg bg-primary/10 p-1.5 ring-1 ring-primary/20">
              <ReceiptText className="size-4 text-primary sm:size-5" />
            </div>
            Invoice History
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Your past invoices and payment receipts.
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <Table>
          <TableCaption className="sr-only">
            List of past invoices with dates, amounts, status and download actions
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Payment Method</TableHead>
              <TableHead className="text-right">Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No invoices yet
                </TableCell>
              </TableRow>
            )}
            {invoices.map((inv) => (
              <TableRow key={inv.payment_id} className="group">
                <TableCell className="text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays className="size-3.5" />
                    {new Date(inv.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {inv.currency === "USD" ? "$" : inv.currency === "INR" ? "₹" : `${inv.currency} `}
                  {Number(inv.total_amount) / 100}
                </TableCell>
                <TableCell className="text-right">{getStatusBadge(inv.status)}</TableCell>
                <TableCell className="text-right">
                  {inv.card_network && inv.card_last_four ? (
                    <span className="flex items-center justify-end gap-2 font-medium">
                      {getPaymentMethodLogo(inv.card_network)} {inv.card_last_four}
                    </span>
                  ) : (
                    <span className="font-medium">{inv.payment_method || "N/A"}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex place-items-center gap-3 rounded-xl"
                    onClick={() => {
                      const url =
                        process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
                          ? "https://live.dodopayments.com"
                          : "https://test.dodopayments.com";
                      window.open(`${url}/invoices/payments/${inv.payment_id}`, "_blank");
                    }}
                    aria-label={`Download invoice ${inv.payment_id}`}
                  >
                    <Download className="size-3.5" />
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

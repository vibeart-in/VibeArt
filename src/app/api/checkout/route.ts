import { Checkout } from "@dodopayments/nextjs";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const { origin } = new URL(req.url);
  const handler = Checkout({
    bearerToken:
      process.env.NODE_ENV === "development"
        ? process.env.DODO_PAYMENTS_API_KEY_TEST!
        : process.env.DODO_PAYMENTS_API_KEY_LIVE!,
    returnUrl: `${origin}/user/dashboard`,
    environment: process.env.NODE_ENV === "development" ? "test_mode" : "live_mode",
    type: "static",
  });

  return handler(req);
};

export const POST = async (req: NextRequest) => {
  const { origin } = new URL(req.url);
  const handler = Checkout({
    bearerToken:
      process.env.NODE_ENV === "development"
        ? process.env.DODO_PAYMENTS_API_KEY_TEST!
        : process.env.DODO_PAYMENTS_API_KEY_LIVE!,
    returnUrl: `${origin}/user/dashboard`,
    environment: process.env.NODE_ENV === "development" ? "test_mode" : "live_mode",
    type: "dynamic",
  });

  return handler(req);
};

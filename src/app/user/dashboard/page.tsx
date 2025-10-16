import { HydrationBoundary } from "@tanstack/react-query";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getUser } from "@/src/actions/getUser";
import { getProducts } from "@/src/actions/subscription/getProducts";
import { getUserSubscription } from "@/src/actions/subscription/getUserSubscriptionFull";
import { getInvoices } from "@/src/actions/user/getInvoices";
import AnimatedGradientBackground from "@/src/components/ui/animated-gradient-background";
import { Dashboard } from "@/src/components/user/dashboard/dashboard";

export default async function DashboardPage() {
  const userRes = await getUser();
  const productRes = await getProducts();
  const userSubscriptionRes = await getUserSubscription();
  const invoicesRes = await getInvoices();
  if (!userRes.success) {
    redirect("/login");
  }

  if (!productRes.success || !userSubscriptionRes.success || !invoicesRes.success) {
    // TODO: Replace this with an error boundary
    return <div>Internal Server Error</div>;
  }

  return (
    <div className="relative h-screen overflow-hidden px-2">
      <Dashboard
        products={productRes.data}
        user={userRes.data}
        userSubscription={userSubscriptionRes.data}
        invoices={invoicesRes.data}
      />
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backgroundImage: "url(/images/landing/grain.png)",
          backgroundSize: "100px 100px",
          mixBlendMode: "overlay",
        }}
      />
      <div className="absolute top-0 -z-20 h-screen w-screen overflow-hidden">
        {/* <Image
          src={
            "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/gradients/black-and-white.webp"
          }
          alt="gradients"
          className="h-full w-full object-cover object-top"
          fill
        /> */}
        <AnimatedGradientBackground
          gradientColors={[
            "#000000", // pure black
            "#1A1A1A",
            "#333333",
            "#4D4D4D",
            "#666666",
            "#B3B3B3",
            "#FFFFFF", // pure white
          ]}
          Breathing={true}
        />
      </div>
    </div>
  );
}

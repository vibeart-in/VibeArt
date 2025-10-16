import { PhoneCall } from "lucide-react";
import Image from "next/image";

import { getUser } from "@/src/actions/getUser";
import { getProducts } from "@/src/actions/subscription/getProducts";
import { getUserSubscription } from "@/src/actions/subscription/getUserSubscriptionFull";
import { EnterpriseCTA } from "@/src/components/landing/pricing/EnterpriseCTA";
import { FeatureComparison } from "@/src/components/landing/pricing/FeatureComparison";
import { PricingHero } from "@/src/components/landing/pricing/PricingHero";
import TrustedBy from "@/src/components/landing/pricing/TrustedBy";
import { FloatingParticles } from "@/src/components/shaders/FloatingParticles";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { FaqAccordion } from "@/src/components/ui/faq-chat-accordion";

const FAQData = [
  {
    id: 1,
    question: "What is VibeArt?",
    answer:
      "VibeArt is a creative platform that gives you access to a powerful suite of best-in-class AI models for generating images, videos, and custom styles. We provide a streamlined interface to models like Flux, Imagen 4, Midjourney, and SDXL, all powered by a simple credit system.",
    icon: "🔥",
    iconPosition: "left" as const,
  },
  {
    id: 2,
    question: "How does the credit system work?",
    answer:
      "Every action on VibeArt, like generating an image or upscaling, costs a certain number of credits. More advanced models cost more credits per generation. Your subscription plan gives you a monthly allowance of credits to use on any model you choose.",
  },
  {
    id: 4,
    question: "Can I use the images I generate for commercial purposes?",
    answer:
      "Yes! Users on any of our paid subscription plans (Pro, creator) have full ownership rights to their creations and can use them for any personal or commercial project without attribution.",
    icon: "©️",
    iconPosition: "left" as const,
  },
  {
    id: 5,
    question: "What happens if I run out of credits?",
    answer:
      "If your monthly allowance runs out, you can easily purchase additional one-time credit packs to continue generating without having to upgrade your entire plan. You'll be notified when your balance is running low.",
    icon: "📈",
    iconPosition: "right" as const,
  },
  {
    id: 6,
    question: "Do my unused credits roll over to the next month?",
    answer:
      "Credits from your monthly subscription plan do not roll over. Your credit balance is refilled to your plan's amount at the start of each billing cycle. However, credits purchased in one-time packs do not expire.",
  },
  {
    id: 7,
    question: "How can I manage or cancel my subscription?",
    answer:
      "You can easily upgrade, downgrade, or cancel your subscription at any time from your account dashboard. All billing is securely managed through our payment partner, Stripe.",
    icon: "⚙️",
    iconPosition: "left" as const,
  },
  {
    id: 8,
    question: "How secure is my data and my creations?",
    answer:
      "We prioritize your security and privacy. All data is encrypted in transit and at rest. We will never use your private generations to train AI models. Enterprise plans offer advanced security features like SSO.",
    icon: "🔒",
    iconPosition: "right" as const,
  },
];

const page = async () => {
  const userRes = await getUser();
  const productRes = await getProducts();
  const userSubscriptionRes = await getUserSubscription();

  if (!productRes.success) {
    // TODO: Replace this with an error boundary
    return <div>Internal Server Error</div>;
  }

  return (
    <main className="relative overflow-hidden">
      <div className="relative">
        <div className="relative overflow-hidden pb-4">
          <div className="absolute inset-0 z-0">
            <FloatingParticles count={50} />
            <div
              className="pointer-events-none absolute inset-0 z-10 opacity-50"
              style={{
                backgroundImage: "url(/images/landing/grain.png)",
                backgroundSize: "100px 100px",
                backgroundRepeat: "repeat",
                backgroundBlendMode: "overlay",
                backgroundPosition: "left top",
              }}
            />
            <div className="relative">
              <Image
                src={
                  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/pricing/light-ray-boy-small.webp"
                }
                width={1000}
                height={800}
                alt="pricing image -z-10"
                className="w-full"
              />
              <div className="absolute inset-x-0 bottom-0 z-10 h-[100px] bg-black backdrop-blur-lg [mask-image:linear-gradient(to_top,white,transparent)] sm:h-[200px]" />
            </div>
          </div>

          <svg
            width="1287"
            height="624"
            viewBox="0 0 1287 624"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute inset-0 z-0 h-auto w-full"
          >
            <path
              d="M491.105 515.524H802.053M0.654756 -12.6318L0.654726 624M42.1145 -12.6318L42.1145 624M83.5742 -12.6318L83.5742 624M125.034 -12.6318L125.034 624M166.494 -12.6318L166.494 624M207.953 -12.6318L207.953 624M249.413 -12.6318L249.413 624M290.873 -12.6318L290.873 624M332.333 -12.6318L332.333 624M0.183594 598.659H1285.44M373.792 -12.6318L373.792 624M0.183594 559.537H1285.44M415.252 -12.6318L415.252 624M0.183594 520.414H1285.44M456.712 -12.6318L456.712 624M0.183594 481.291H1285.44M498.172 -12.6318L498.172 624M0.183594 442.169H1285.44M539.631 -12.6318L539.631 624M0.183594 403.046H1285.44M581.091 -12.6318L581.091 624M0.183594 363.923H1285.44M622.551 -12.6318L622.551 624M0.183594 324.801H1285.44M664.011 -12.6318L664.011 624M0.183594 285.678H1285.44M705.47 -12.6318L705.47 624M0.183594 246.556H1285.44M746.93 -12.6318L746.93 624M0.183594 207.433H1285.44M788.39 -12.6318L788.39 624M0.183594 168.31H1285.44M829.85 -12.6318L829.85 624M0.183594 129.188H1285.44M871.309 -12.6318L871.309 624M0.183594 90.0651H1285.44M912.769 -12.6318L912.769 624M0.183594 50.9425H1285.44M954.229 -12.6318L954.229 624M0.183594 11.8199H1285.44M995.689 -12.6318V624M0.183594 -27.3027L1285.44 -27.3027M1037.15 -12.6318V624M1078.61 -12.6318V624M1120.07 -12.6318V624M1161.53 -12.6318V624M1202.99 -12.6318V624M1244.45 -12.6318V624M1285.91 -12.6318V624"
              stroke="url(#paint0_radial_440_1118)"
              strokeWidth="0.888544"
            />
            <defs>
              <radialGradient
                id="paint0_radial_440_1118"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(643.045 259.697) rotate(90) scale(364.303 719.163)"
              >
                <stop stopColor="white" stopOpacity="0.12" />
                <stop offset="0.6" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
          {/* Use responsive margin top */}
          <div className="absolute left-1/2 top-0 z-20 mt-16 flex w-full -translate-x-1/2 flex-col items-center justify-center gap-10 px-4 sm:mt-32">
            <div className="z-20 flex h-7 w-full max-w-xs flex-row items-center justify-center gap-2.5 rounded-full border border-[#2BFFFF]/50 bg-[#2BFFFF]/20 px-3 py-1.5 backdrop-blur-[12px] sm:max-w-sm">
              <span className="h-4 w-full text-center text-xs font-bold leading-4 tracking-[0.02em] text-black/70">
                Bring your creativity to best scale
              </span>
            </div>
            <div
              // Use responsive text sizes
              className="z-20 w-full max-w-3xl text-center text-4xl font-normal leading-tight tracking-[-0.04em] md:text-5xl lg:text-[70px] lg:leading-[80px]"
              style={{
                fontFamily: "'Space Grotesk'",
                background: "linear-gradient(180deg, #FFFFFF 50%, #e4f13e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              The Smartest AI Image Generation, Period
            </div>
            {/* Use responsive width */}
            <p className="w-full max-w-xl text-center text-white">
              Generate more for less – the cheapest per-image generation compared to any other
              service. Pick a plan that fits your needs.
            </p>
          </div>

          {/* Pricing Cards Container */}
          {/* Use responsive padding top */}
          <div className="relative z-30 px-4 pt-96 sm:px-8 sm:pt-[500px]">
            <PricingHero
              products={productRes.data}
              user={userRes.success ? userRes.data : null}
              userSubscription={userSubscriptionRes.success ? userSubscriptionRes.data : null}
            />
            <div className="mb-12 flex w-full items-center justify-center">
              <EnterpriseCTA />
            </div>
            <FeatureComparison />
          </div>
        </div>
      </div>
      <TrustedBy />
      <div className="relative px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start gap-16 lg:flex-row">
            <div className="flex flex-col gap-10 lg:flex-1">
              <div className="flex flex-col gap-4">
                <div>
                  <Badge variant="outline">FAQ</Badge>
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="font-regular max-w-xl text-left text-3xl tracking-tighter md:text-5xl">
                    This is the start of something new
                  </h4>
                  <p className="max-w-xl text-left text-lg leading-relaxed tracking-tight text-muted-foreground lg:max-w-lg">
                    Managing a small business today is already tough. Avoid further complications by
                    ditching outdated, tedious trade methods. Our goal is to streamline SMB trade,
                    making it easier and faster than ever.
                  </p>
                </div>
                <div className="">
                  <Button className="flex items-center justify-center gap-4" variant="secondary">
                    Any questions? Reach out <PhoneCall className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="w-full lg:flex-1">
              <FaqAccordion
                data={FAQData}
                className="w-full max-w-[700px]"
                timestamp="Updated daily at 12:00 PM"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;

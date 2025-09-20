import {
  MouseParallaxItem,
  MouseParallaxProvider,
} from "@/src/components/landing/MouseParallax";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { PhoneCall } from "lucide-react";
import Image from "next/image";
import TrustedBy from "@/src/components/landing/pricing/TrustedBy";
import { FaqAccordion } from "@/src/components/ui/faq-chat-accordion";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { FloatingParticles } from "@/src/components/shaders/FloatingParticles";
import { EnterpriseCTA } from "@/src/components/landing/pricing/EnterpriseCTA";
import { PricingHero } from "@/src/components/landing/pricing/PricingHero";
import { FeatureComparison } from "@/src/components/landing/pricing/FeatureComparison";
import { getCurrentUserSubscriptionDetails } from "@/src/app/(site)/pricing/actions";

const FAQData = [
  {
    id: 1,
    question: "What is Aura.ai?",
    answer:
      "Aura.ai is a creative platform that gives you access to a powerful suite of best-in-class AI models for generating images, videos, and custom styles. We provide a streamlined interface to models like Flux, Imagen 4, Midjourney, and SDXL, all powered by a simple credit system.",
    icon: "🤖",
    iconPosition: "left" as const,
  },
  {
    id: 2,
    question: "How does the credit system work?",
    answer:
      "Every action on Aura.ai, like generating an image or upscaling, costs a certain number of credits. More advanced models cost more credits per generation. Your subscription plan gives you a monthly allowance of credits to use on any model you choose.",
    icon: "💳",
    iconPosition: "right" as const,
  },
  {
    id: 3,
    question: "What's the difference between the subscription plans?",
    answer:
      "We have several tiers to fit your needs. The 'Free' plan offers a small number of credits to let you try the platform. Paid plans like 'Basic', 'Pro', and 'Max' provide a larger monthly credit allowance, access to premium models, and faster generation speeds.",
    icon: "🚀",
  },
  {
    id: 4,
    question: "Can I use the images I generate for commercial purposes?",
    answer:
      "Yes! Users on any of our paid subscription plans (Basic, Pro, Max) have full ownership rights to their creations and can use them for any personal or commercial project without attribution.",
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
      "We prioritize your security and privacy. All data is encrypted in transit and at rest. We will never use your private generations to train AI models without your explicit permission. Enterprise plans offer advanced security features like SSO.",
    icon: "🔒",
    iconPosition: "right" as const,
  },
];

const page = async () => {
  const userSubscriptionStatus = await getCurrentUserSubscriptionDetails();

  return (
    <main className="relative overflow-hidden">
      <div className="relative">
        <MouseParallaxProvider className="relative pb-4 overflow-hidden">
          <MouseParallaxItem strength={0} className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 z-10 pointer-events-none opacity-60"
              style={{
                backgroundImage: "url(/images/landing/grain.png)",
                backgroundSize: "100px 100px",
                backgroundRepeat: "repeat",
                backgroundBlendMode: "overlay",
                backgroundPosition: "left top",
              }}
            />
            <FloatingParticles count={50} />
            <Image
              src={"/images/pricing/light-ray-boy.jpg"}
              width={1000}
              height={800}
              alt="pricing image"
              className="w-full"
              priority
            />
            <div className="z-10 absolute inset-x-0 bottom-1/3 h-[100px] sm:h-[200px] bg-black/20 [mask-image:linear-gradient(to_top,white,transparent)] backdrop-blur-md" />
            <div className="z-10 absolute inset-x-0 bottom-1/3 h-[100px] sm:h-[200px] bg-black/20 [mask-image:linear-gradient(to_top,white,transparent)] backdrop-blur-md" />
            <div className="z-10 absolute inset-x-0 bottom-1/3 h-[100px] sm:h-[200px] bg-black/20 [mask-image:linear-gradient(to_top,white,transparent)] backdrop-blur-md" />
          </MouseParallaxItem>
          <div>
            <MouseParallaxItem strength={40} className="absolute inset-0 z-10">
              <div
                className="absolute w-[197px] h-[578px] blur-[40px] -rotate-[8deg] bg-cyan-400/20"
                style={{
                  left: "980px",
                  top: "-180px",
                  background:
                    "linear-gradient(180deg, rgba(43, 255, 255, 0.24) 0%, rgba(43, 255, 255, 0) 100%)",
                }}
              />
            </MouseParallaxItem>
            <MouseParallaxItem strength={30} className="absolute inset-0 z-10">
              <div
                className="absolute w-[251px] h-[545px] blur-[40px] bg-cyan-400/20"
                style={{
                  left: "calc(50% - 125.5px)",
                  top: "0px",
                  background:
                    "linear-gradient(180deg, rgba(43, 255, 255, 0.24) 0%, rgba(43, 255, 255, 0) 100%)",
                }}
              />
            </MouseParallaxItem>
            <MouseParallaxItem strength={35} className="absolute inset-0 z-10">
              <div
                className="absolute w-[205px] h-[578px] blur-[40px] rotate-[8deg] bg-cyan-400/20"
                style={{
                  left: "280px",
                  top: "-80px",
                  background:
                    "linear-gradient(180deg, rgba(43, 255, 255, 0.24) 0%, rgba(43, 255, 255, 0) 100%)",
                }}
              />
            </MouseParallaxItem>
          </div>
          <svg
            width="1287"
            height="624"
            viewBox="0 0 1287 624"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-auto z-10 pointer-events-none"
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
          <div className="absolute left-1/2 top-0 mt-32 gap-10 z-20 -translate-x-1/2 flex flex-col justify-center items-center">
            <div className="z-20 flex flex-row border bg-[#2BFFFF]/20 border-[#2BFFFF]/50 justify-center items-center px-3 py-1.5 gap-2.5 w-[250px] h-7 rounded-full backdrop-blur-[12px]">
              <span className="w-[226px] h-4 font-bold text-xs leading-4 text-center tracking-[0.02em] text-black/70">
                Bring your creativity to best scale
              </span>
            </div>
            <div
              className="z-20 w-[650px]  font-normal text-[70px] leading-[80px] text-center tracking-[-0.04em]"
              style={{
                fontFamily: "'Space Grotesk'",
                background:
                  "linear-gradient(180deg, #FFFFFF 50%, #e4f13e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              The Smartest AI Image Generation, Period
            </div>
            <p className="text-white w-[600px] text-center">
              Generate more for less – the cheapest per-image generation
              compared to any other service. Pick a plan that fits your needs.
            </p>
          </div>
          <div className="w-[600px] h-[250px] bg-black blur-[200px] rounded-full absolute top-40 left-1/3 -translate-x-12 z-10"></div>

          {/* Pricing Cards Container */}
          <div className="relative pt-[500px] z-30 px-8">
            <Tabs defaultValue="monthly" className="w-full max-w-7xl mx-auto">
              {/* Billing Toggle */}
              <div className="flex justify-center mb-12">
                <TabsList className="bg-white/10 backdrop-blur-md border border-white/20 p-1 rounded-xl">
                  <TabsTrigger
                    value="monthly"
                    className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg transition-all"
                  >
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger
                    value="yearly"
                    className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg transition-all"
                  >
                    Yearly
                    <span className="ml-2 bg-cyan-400 text-black text-xs px-2 py-0.5 rounded-full font-semibold">
                      Save 20%
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>
              <PricingHero userSubscriptionDetails={userSubscriptionStatus} />
            </Tabs>
            <div className="w-full flex justify-center items-center mb-12">
              <EnterpriseCTA />
            </div>
            <FeatureComparison />
          </div>
        </MouseParallaxProvider>
      </div>
      <TrustedBy />
      <div className="relative py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="flex gap-10 flex-col lg:flex-1">
              <div className="flex gap-4 flex-col">
                <div>
                  <Badge variant="outline">FAQ</Badge>
                </div>
                <div className="flex gap-2 flex-col">
                  <h4 className="text-3xl md:text-5xl tracking-tighter max-w-xl text-left font-regular">
                    This is the start of something new
                  </h4>
                  <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
                    Managing a small business today is already tough. Avoid
                    further complications by ditching outdated, tedious trade
                    methods. Our goal is to streamline SMB trade, making it
                    easier and faster than ever.
                  </p>
                </div>
                <div className="">
                  <Button
                    className="flex justify-center items-center gap-4"
                    variant="secondary"
                  >
                    Any questions? Reach out <PhoneCall className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="lg:flex-1">
              <FaqAccordion
                data={FAQData}
                className="max-w-[700px]"
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

import { ArrowRight } from "lucide-react";

export const EnterpriseCTA = () => {
  return (
    <div
      className="mt-16 flex w-full max-w-4xl flex-col items-center gap-6 rounded-[32px] border border-white/10 p-10 text-center"
      style={{
        background:
          "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
      }}
    >
      <h3 className="text-2xl font-bold text-white">Looking for an Enterprise Solution?</h3>
      <p className="max-w-2xl text-white/70">
        We offer custom plans for large teams with needs for dedicated infrastructure, customized
        generations, and bespoke security and compliance features.
      </p>
      <button className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-gray-200">
        <span>Contact Sales</span>
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
};

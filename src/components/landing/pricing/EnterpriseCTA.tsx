import { ArrowRight } from "lucide-react";

export const EnterpriseCTA = () => {
  return (
    <div
      className="w-full max-w-4xl text-center flex flex-col items-center gap-6 p-10 rounded-[32px] border border-white/10 mt-16"
      style={{
        background: "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)"
      }}
    >
      <h3 className="text-2xl font-bold text-white">Looking for an Enterprise Solution?</h3>
      <p className="text-white/70 max-w-2xl">
        We offer custom plans for large teams with needs for dedicated infrastructure, customized generations, and bespoke security and compliance features.
      </p>
      <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-colors">
        <span>Contact Sales</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
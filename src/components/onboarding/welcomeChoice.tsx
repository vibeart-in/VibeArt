import { motion } from "motion/react";

type Option = { key: string; label: string };

export default function WelcomeChoice({
  options,
  skipKey = "skip",
  isLoading,
  choice,
  handleSelect,
  getUserDisplayName,
}: {
  options: Option[];
  skipKey?: string;
  isLoading: boolean;
  choice?: string | null;
  handleSelect: (k: string) => void;
  getUserDisplayName: () => string;
}) {
  const mainOptions = options.filter((o) => o.key !== skipKey);
  const skipOption = options.find((o) => o.key === skipKey);

  return (
    <div className="mx-auto flex size-full max-w-7xl flex-col items-center justify-center px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8 lg:py-12">
      <div className="flex w-full flex-col items-center justify-center gap-6 text-center sm:gap-8 lg:gap-16">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-1 font-satoshi sm:space-y-2"
        >
          <h1 className="text-balance text-[clamp(1.75rem,8vw,6rem)] font-extrabold leading-[0.9] tracking-tight">
            Welcome,
          </h1>
          <h1 className="text-balance break-words text-[clamp(1.75rem,8vw,6rem)] font-extrabold leading-[0.9] tracking-tight text-accent">
            {getUserDisplayName()}!
          </h1>
        </motion.div>

        {/* Question and Options Section */}
        <div className="w-full max-w-4xl space-y-6 sm:space-y-8 lg:space-y-12">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="px-2 text-center text-lg font-semibold leading-tight sm:text-xl md:text-2xl lg:text-3xl"
          >
            What do you plan to create with VibeArt?
          </motion.h2>

          {/* Responsive Grid Layout for Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5 lg:flex lg:flex-wrap lg:justify-center lg:gap-6"
          >
            {mainOptions.map((opt, idx) => (
              <motion.button
                key={opt.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.5 + idx * 0.1,
                  ease: "easeOut",
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(255,255,255,0.2)",
                  transition: { duration: 0.25 },
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(opt.key)}
                disabled={isLoading}
                className="relative flex min-h-[56px] items-center justify-center rounded-full border-2 border-white bg-gradient-to-tr from-white/10 to-white/5 px-6 py-3 text-base font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:bg-gradient-to-br hover:from-white/20 hover:to-white/10 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[60px] sm:px-8 sm:py-4 sm:text-lg lg:min-w-[150px]"
                title={opt.label}
              >
                {isLoading && choice === opt.key ? (
                  <div className="flex items-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-accent/40 border-t-accent" />
                    <span className="text-sm sm:text-base">Directing you to create...</span>
                  </div>
                ) : (
                  <span className="line-clamp-2 px-2">{opt.label}</span>
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Skip Button */}
          {skipOption && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
              className="flex justify-center pt-2 sm:pt-4"
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 12px 30px rgba(255,255,255,0.25)",
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(skipOption.key)}
                disabled={isLoading}
                className="w-full max-w-md rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 px-8 py-4 text-base font-bold text-white shadow-2xl transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:px-12 sm:py-5 sm:text-lg lg:py-6 lg:text-xl"
                title={skipOption.label}
              >
                {isLoading && choice === skipOption.key ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white sm:size-5" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  skipOption.label
                )}
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

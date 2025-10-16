export default function WelcomeChoiceSkeleton() {
  return (
    <div className="mx-auto flex size-full max-w-7xl flex-col items-center justify-center px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8 lg:py-12">
      <div className="flex w-full animate-pulse flex-col items-center justify-center gap-6 text-center sm:gap-8 lg:gap-16">
        {/* Welcome Header Skeleton */}
        <div className="space-y-3 sm:space-y-4">
          <div className="h-12 w-64 rounded-md bg-white/10 sm:h-16 sm:w-80 lg:h-24 lg:w-[480px]"></div>
          <div className="h-12 w-56 rounded-md bg-accent/10 sm:h-16 sm:w-72 lg:h-24 lg:w-[450px]"></div>
        </div>

        {/* Question and Options Section Skeleton */}
        <div className="w-full max-w-4xl space-y-6 sm:space-y-8 lg:space-y-12">
          {/* Question Skeleton */}
          <div className="mx-auto h-8 w-3/4 rounded-md bg-white/10 sm:h-9 md:h-10 lg:h-12"></div>

          {/* Options Skeleton */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5 lg:flex lg:flex-wrap lg:justify-center lg:gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[56px] min-w-[150px] rounded-full bg-white/5 sm:h-[60px]"
              ></div>
            ))}
          </div>

          {/* Skip Button Skeleton */}
          <div className="flex justify-center pt-2 sm:pt-4">
            <div className="h-[60px] w-full max-w-md rounded-full bg-purple-500/10 sm:h-[68px] lg:h-[76px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

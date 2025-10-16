const PageSkeleton = () => {
  return (
    <main className="relative animate-pulse overflow-hidden bg-black">
      {/* Hero Section Skeleton */}
      <div className="relative pb-4">
        <div className="absolute inset-0 z-0">
          {/* Background Image Placeholder */}
          <div className="h-[600px] w-full bg-black/50 sm:h-[800px]"></div>
          {/* Faded bottom edge */}
          <div className="absolute inset-x-0 bottom-0 z-10 h-[100px] bg-black/50 [mask-image:linear-gradient(to_top,black,transparent)] sm:h-[200px]" />
        </div>

        {/* Hero Content Skeleton */}
        <div className="absolute left-1/2 top-0 z-20 mt-16 flex w-full -translate-x-1/2 flex-col items-center justify-center gap-10 px-4 sm:mt-32">
          {/* Top Banner Skeleton */}
          <div className="h-7 w-full max-w-xs rounded-full bg-white/10 sm:max-w-sm"></div>

          {/* Main Heading Skeleton */}
          <div className="h-20 w-full max-w-3xl rounded-lg bg-white/20 md:h-24 lg:h-28"></div>

          {/* Subheading Skeleton */}
          <div className="h-10 w-full max-w-xl rounded-md bg-white/10"></div>
        </div>

        {/* Pricing Cards Skeleton */}
        <div className="relative z-30 px-4 pt-96 sm:px-8 sm:pt-[500px]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Mimic 3 pricing cards */}
            <div className="h-[450px] w-full rounded-2xl bg-white/5"></div>
            <div className="h-[450px] w-full rounded-2xl bg-white/10"></div>
            <div className="h-[450px] w-full rounded-2xl bg-white/5"></div>
          </div>
          {/* CTA and Feature Comparison Skeleton */}
          <div className="mt-12 flex w-full flex-col items-center justify-center gap-12">
            <div className="h-20 w-full max-w-2xl rounded-full bg-purple-500/10"></div>
            <div className="h-[400px] w-full max-w-7xl rounded-2xl bg-white/5"></div>
          </div>
        </div>
      </div>

      {/* TrustedBy Section Skeleton */}
      <div className="h-40 w-full bg-black/20"></div>

      {/* FAQ Section Skeleton */}
      <div className="relative px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start gap-16 lg:flex-row">
            {/* Left side content */}
            <div className="flex w-full flex-col gap-8 lg:flex-1">
              <div className="h-8 w-16 rounded-md bg-white/10"></div>
              <div className="space-y-4">
                <div className="h-12 w-full max-w-xl rounded-md bg-white/10"></div>
                <div className="h-12 w-3/4 max-w-lg rounded-md bg-white/10"></div>
              </div>
              <div className="h-10 w-full max-w-lg rounded-md bg-white/5"></div>
              <div className="h-12 w-48 rounded-full bg-white/10"></div>
            </div>
            {/* Right side Accordion */}
            <div className="w-full lg:flex-1">
              <div className="flex w-full max-w-[700px] flex-col gap-4">
                <div className="h-16 w-full rounded-lg bg-white/5"></div>
                <div className="h-16 w-full rounded-lg bg-white/5"></div>
                <div className="h-16 w-full rounded-lg bg-white/5"></div>
                <div className="h-16 w-full rounded-lg bg-white/5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PageSkeleton;

export default function MessageSkeleton() {
  return (
    <div className="flex w-full max-w-7xl animate-pulse flex-col lg:flex-row">
      {/* Skeleton for Prompt Box */}
      <div className="h-fit w-full flex-shrink-0 overflow-hidden rounded-3xl bg-[#111111] lg:w-[320px]">
        {/* Skeleton for Prompt Text */}
        <div className="max-h-[200px] p-4">
          <div className="space-y-3">
            <div className="h-4 rounded bg-gray-700/50"></div>
            <div className="h-4 w-5/6 rounded bg-gray-700/50"></div>
            <div className="h-4 w-3/4 rounded bg-gray-700/50"></div>
            <div className="h-4 w-4/6 rounded bg-gray-700/50"></div>
          </div>
        </div>

        {/* Skeleton for Footer */}
        <div className="relative flex items-center justify-between bg-black/20 p-3 px-4">
          <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

          {/* Left: Copy + Credits */}
          <div className="flex items-center gap-4">
            <div className="size-8 rounded-full bg-gray-700/50"></div>
            <div className="h-4 w-12 rounded bg-gray-700/50"></div>
          </div>

          {/* Right: Model Name */}
          <div className="h-4 w-24 rounded bg-gray-700/50"></div>
        </div>
      </div>

      {/* Skeleton for Images Section */}
      <div className="mt-6 w-full lg:mt-0 lg:pl-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {[...Array(1)].map((_, index) => (
            <div key={index} className="aspect-square w-full rounded-xl bg-[#111111]" />
          ))}
        </div>
      </div>
    </div>
  );
}

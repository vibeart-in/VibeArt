const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-800/80 ${className || ""}`} />
);

export default function Loading() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center overflow-y-scroll bg-black">
      <div className="z-10 my-8 mt-32 flex flex-col items-center justify-center">
        <div className="flex h-[60vh] w-full max-w-xl flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 p-8">
          <Skeleton className="mb-4 h-16 w-16 rounded-full" />
          <Skeleton className="mb-2 h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

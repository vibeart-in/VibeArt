const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={`bg-gray-800/80 animate-pulse rounded-lg ${className || ""}`}
  />
);

export default function Loading() {
  return (
    <div className="relative w-full h-screen flex flex-col bg-black overflow-y-scroll items-center">
      <div className="z-10 my-8 mt-32 flex flex-col justify-center items-center">
        <div className="flex flex-col items-center justify-center w-full max-w-xl h-[60vh] border-2 border-dashed border-gray-700 rounded-xl p-8">
            <Skeleton className="w-16 h-16 mb-4 rounded-full" />
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}
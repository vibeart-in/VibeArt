import { IconCopy, IconDiamondFilled, IconPhoto, IconExclamationCircle } from "@tabler/icons-react";

export default function MessageSkeleton() {
  return (
    <div className="flex animate-pulse">
      {/* Left Column Skeleton */}
      <div className="w-[300px] flex-shrink-0">
        {/* Prompt Box Skeleton */}
        <div className="h-[120px] w-full rounded-3xl bg-neutral-800 p-4">
          <div className="h-4 w-5/6 rounded-full bg-neutral-700"></div>
          <div className="mt-3 h-4 w-4/6 rounded-full bg-neutral-700"></div>
          <div className="mt-3 h-4 w-5/6 rounded-full bg-neutral-700"></div>
        </div>

        {/* Action Buttons & Model Skeleton */}
        <div className="mt-2 flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Copy Icon Skeleton */}
            <div className="h-8 w-8 rounded-lg bg-neutral-800"></div>
            {/* Credit Cost Skeleton */}
            <div className="h-8 w-16 rounded-lg bg-neutral-800"></div>
          </div>

          {/* Model Name Skeleton */}
          <div className="h-5 w-28 rounded-full bg-neutral-800"></div>
        </div>
      </div>

      {/* Right Column Skeleton (Image Outputs) */}
      <div className="pl-4">
        <div className="flex flex-wrap gap-4">
          {/* You can change the number of skeleton cards to match your default output */}
          {/* <div className="h-[360px] w-[360px] rounded-2xl bg-neutral-800"></div> */}
          <div className="h-[360px] w-[360px] rounded-2xl bg-neutral-800"></div>
        </div>
      </div>
    </div>
  );
}

import MessageSkeleton from "@/src/components/chat/MessageSkeleton";

export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-12 overflow-y-auto bg-background px-4 pb-4 pt-32 text-white">
      <MessageSkeleton />
      <MessageSkeleton />
    </div>
  );
}

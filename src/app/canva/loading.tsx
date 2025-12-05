import MessageSkeleton from "@/src/components/chat/MessageSkeleton";

export default function Loading() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-12 overflow-y-auto bg-black px-4 pb-4 pt-32 text-white">
      <MessageSkeleton />
    </div>
  );
}

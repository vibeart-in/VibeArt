import GenerationHistory from "@/src/components/home/GenerationHistory";
import { ConversationType } from "@/src/types/BaseType";

export default function CanvaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative flex size-full flex-row">
      <section className="size-full">{children}</section>
      <div className="hidden sm:block">
        <GenerationHistory side="right" forcedType={ConversationType.CANVA} />
      </div>
    </main>
  );
}

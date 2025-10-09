// app/conversation/[id]/page.tsx
import ConversationClient from "@/src/components/chat/ConversationClient";

export default async function ConversationPage(props: PageProps<"/image/generate/[id]">) {
  const { id } = await props.params;
  return <ConversationClient conversationId={id} />;
}

// app/conversation/[id]/page.tsx
import ConversationClient from "@/src/components/chat/ConversationClient";

export default async function ConversationPage(props: PageProps<"/generate/image/[id]">) {
  const { id } = await props.params;
  return <ConversationClient key={id} conversationId={id} />;
}

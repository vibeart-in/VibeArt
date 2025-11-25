import ConversationClient from "@/src/components/chat/ConversationClient";
import EditConversationClient from "@/src/components/edit/EditConversationClient";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the async params object (Next.js 15 change)
  const { id } = await params;

  // Pass id to client component
  return <EditConversationClient key={id} conversationId={id} />;
}

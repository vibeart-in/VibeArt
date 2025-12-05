import CanvaEditorClient from "@/src/components/canva/CanvaEditorClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CanvaPage(props: PageProps) {
  const { id } = await props.params;
  return <CanvaEditorClient conversationId={id} />;
}

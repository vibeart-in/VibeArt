"use client";

import { IconExclamationCircle } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import InputBox from "@/src/components/inputBox/InputBox";
import { useConversationMessages } from "@/src/hooks/useConversationMessages";
import MessageSkeleton from "@/src/components/chat/MessageSkeleton";

import { createClient } from "@/src/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

// Dynamically import EditorCanvas to avoid SSR issues with Konva
const EditorCanvas = dynamic(() => import("@/src/components/editor/EditorCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a] text-gray-500">
      Loading Editor...
    </div>
  ),
});

export default function CanvaEditorClient({ conversationId }: { conversationId?: string }) {
  const { data: messages, isLoading, isError } = useConversationMessages(conversationId);
  const [inputBoxKey, setInputBoxKey] = useState(0);
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Extract ALL turns for the infinite canvas
  const { turns, isGenerating } = useMemo(() => {
    if (!messages || messages.length === 0) {
      return { turns: [], isGenerating: false };
    }
    
    // messages IS the array of turns (conversationData[])
    // Sort by created_at ascending (Oldest -> Newest)
    const allTurns = [...messages].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        
        // If dates are invalid (e.g. missing), fall back to preserving order (or reversing if we assume API is Descending)
        if (isNaN(dateA) || isNaN(dateB)) return 0;
        
        return dateA - dateB;
    });
    
    // If dates were missing, we might still be in Descending order (Newest First).
    // Let's check if the first item is newer than the last (if we have dates).
    // If we don't have dates, we assume API returns Newest First (standard), so we should reverse it to get Oldest First.
    if (allTurns.length > 1 && !allTurns[0].created_at) {
        allTurns.reverse();
    }
    
    // Check generation status of the LATEST turn
    const latestTurn = allTurns[allTurns.length - 1];
    const status = latestTurn?.job_status;
    const isGen = status === 'pending' || status === 'starting' || status === 'processing' || status === 'QUEUED' || status === 'RUNNING';

    return {
      turns: allTurns,
      isGenerating: isGen
    };
  }, [messages]);

  const handleEditImage = (imageUrl: string) => {
    // Update the URL query parameter to trigger DragAndDropBox in InputBox
    const url = new URL(window.location.href);
    url.searchParams.set("image-url", imageUrl);
    window.history.pushState({}, "", url.toString());
    
    // Force a re-render of InputBox to pick up the new URL param
    setInputBoxKey(prev => prev + 1);
  };

  const handleDeleteTurn = async (turnId: string) => {
      if (!turnId) {
          console.error("handleDeleteTurn called with empty turnId");
          return;
      }
      
      console.log("Deleting turn:", turnId);
      
      try {
          const { error } = await supabase.from('messages').delete().eq('id', turnId);
          if (error) throw error;
          
          console.log("Turn deleted successfully");
          // Invalidate queries to refresh the list
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      } catch (error) {
          console.error("Failed to delete turn:", error);
      }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-12 overflow-y-auto bg-background px-4 pb-4 pt-32 text-white">
        <MessageSkeleton />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-white">
        <div className="flex size-64 flex-col items-center justify-center rounded-2xl bg-red-900/20 p-4 text-center">
          <IconExclamationCircle className="size-8 text-red-500" />
          <p className="mt-2 font-semibold text-red-500">
            Failed to load conversation: <br></br>Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative flex h-screen flex-col bg-background text-white">
      <div className="flex-grow overflow-hidden">
         <EditorCanvas 
            turns={turns}
            isGenerating={isGenerating}
            onEditImage={handleEditImage}
            onDeleteTurn={handleDeleteTurn}
         />
      </div>
      
      {/* Input Box at the bottom for further generations */}
      <footer className="absolute bottom-4 z-10 w-full px-2 pointer-events-none">
        <div className="relative mx-auto flex w-full max-w-full flex-col items-center justify-center text-center pointer-events-auto">
          <InputBox key={inputBoxKey} conversationId={conversationId} />
        </div>
      </footer>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";
import { toast } from "sonner";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<null | { id: string }>(null);
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    // Get the current session / user
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user);
      } else {
        setUser(null);
      }
    });

    // Also listen for auth state changes (login / logout)
    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      authSub.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!user) return;

    const userId = user.id;
    console.log(`Setting up Realtime channel for user ${userId}`);
    const channel = supabase
      .channel(`user-updates:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Profile changed:", payload);
          queryClient.invalidateQueries({ queryKey: ["user", "nav-info"] });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Convo changed:", payload);
          queryClient.invalidateQueries({ queryKey: ["conversationHistory"] });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "jobs",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedJob = payload.new as {
            conversation_id?: string;
            ai_app_id?: string;
            job_status?: string;
            error_message?: string;
            model_name?: string;
          };

          // ✅ Invalidate queries as before
          if (updatedJob.conversation_id) {
            queryClient.invalidateQueries({
              queryKey: ["messages", updatedJob.conversation_id],
            });
          }
          if (updatedJob.ai_app_id && updatedJob.job_status === "succeeded") {
            queryClient.invalidateQueries({
              queryKey: ["appGenerations", updatedJob.ai_app_id],
            });
          }

          if (updatedJob.job_status === "succeeded") {
            toast.success("Generation completed", {
              description: updatedJob.model_name
                ? `Model: ${updatedJob.model_name}`
                : "Your Image generated successfully.",
            });
          }

          if (updatedJob.job_status === "failed" || updatedJob.error_message) {
            toast.error("Generation failed", {
              description: updatedJob.error_message || "Something went wrong.",
            });
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Subscribed to user-updates channel");
        }
      });

    return () => {
      console.log("Unsubscribing realtime channel");
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, supabase]);

  return <>{children}</>;
}

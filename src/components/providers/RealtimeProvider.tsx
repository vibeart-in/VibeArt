"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";
import { User } from "@supabase/supabase-js";

// This provider doesn't render anything, it just sets up the listener.
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    let user: User | null = null;

    const setupSubscription = async () => {
      // First, get the current user
      const { data } = await supabase.auth.getUser();
      user = data.user;

      if (!user) return; // Only subscribe if a user is logged in

      console.log(`Setting up Realtime subscription for user: ${user.id}`);

      // Listen for UPDATE events on the 'profiles' table for the current user.
      const channel = supabase
        .channel("profiles-changes")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newRow = payload?.new; // depending on SDK version
            const oldRow = payload?.old;

            // If oldRow is null it's probably an INSERT — handle accordingly.
            // Only proceed when one of the two tracked columns actually changed:
            const changed =
              !oldRow ||
              newRow.subscription_credits !== oldRow.subscription_credits ||
              newRow.bonus_credits !== oldRow.bonus_credits;

            if (!changed) return; // ignore updates that didn't touch these columns

            console.log({
              subscription_credits: newRow.subscription_credits,
              bonus_credits: newRow.bonus_credits,
            });

            queryClient.invalidateQueries({ queryKey: ["user", "nav-info"] });
          }
        )
        .subscribe();

      // Return a cleanup function to remove the channel when the component unmounts
      return () => {
        console.log("Removing Realtime subscription.");
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, [queryClient]);

  return <>{children}</>;
}

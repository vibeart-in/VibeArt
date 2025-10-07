import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "@supabase/supabase-js";
import Bavatar from "boring-avatars";

export const UserProfile = ({
  className = "",
  user,
}: {
  className?: string;
  user: User | null;
}) => {
  return (
    <div className={cn("group/sidebar flex items-center justify-start gap-2", className)}>
      <Avatar>
        <AvatarImage src={user?.user_metadata?.avatar_url} />
        <AvatarFallback>
          <Bavatar square={true} name={user?.email || "Unknown"} />
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

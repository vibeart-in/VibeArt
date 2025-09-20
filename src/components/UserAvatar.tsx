import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "@supabase/supabase-js";

export const UserProfile = ({
  className = "",
  user,
}: {
  className?: string;
  user: User | null;
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-1.5",
        className
      )}
    >
      <Avatar>
        <AvatarImage src={user?.user_metadata?.avatar_url} />
        <AvatarFallback>{user?.email?.slice(0, 2)}</AvatarFallback>
      </Avatar>
      {/* <motion.span className="text-neutral-700 dark:text-neutral-200 text-base group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block sp-0 m-0 ml-2">
        {user.user_metadata?.id || user.email?.split('@')[0]}
      </motion.span> */}
    </div>
  );
};

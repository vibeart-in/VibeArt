"use client";

import { User } from "@supabase/supabase-js";
import { LoaderCircle, LogOutIcon, Trash2Icon, UserIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { deleteAccount } from "@/src/actions/user/deleteAccount";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { createClient } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";

import { Subscription, UserDetails } from "./dashboard";

interface AccountManagementProps {
  className?: string;
  user: User;
  userSubscription: {
    user: UserDetails;
    subscription: Subscription | null;
  };
}

export function AccountManagement({ className, user, userSubscription }: AccountManagementProps) {
  const [isLoading, setIsLoading] = useState(false);
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    const res = await deleteAccount();
    if (res.success) {
      toast.success("Account deleted successfully");
      window.location.reload();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className={cn("w-full text-left", className)}>
      <Card className="shadow-lg">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <div className="rounded-lg bg-primary/10 p-1.5 ring-1 ring-primary/20">
              <UserIcon className="size-4 text-primary sm:size-5" />
            </div>
            Account Details
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:space-y-8 sm:px-6">
          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 p-3 sm:p-4">
            <Avatar className="size-12">
              <AvatarImage src={user.user_metadata.avatar_url || user.user_metadata.picture} />
              <AvatarFallback>{user.user_metadata.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="mt-2 flex flex-col">
              <h3 className="text-lg font-semibold sm:text-xl">{user.user_metadata.name}</h3>
              <p className="text-sm text-muted-foreground sm:text-base">{user.email}</p>
            </div>
          </div>

          <Separator className="my-4 bg-gradient-to-r from-transparent via-border to-transparent sm:my-6" />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex place-items-center gap-3"
              onClick={handleSignOut}
              variant={"destructive"}
            >
              <LogOutIcon className="size-4 sm:size-5" />
              Logout
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="flex place-items-center gap-3" variant="outline">
                  <Trash2Icon className="size-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and
                    remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button
                    disabled={isLoading}
                    onClick={handleDeleteAccount}
                    variant={isLoading ? "secondary" : "destructive"}
                  >
                    {isLoading ? (
                      <LoaderCircle className="size-4 animate-spin text-muted-foreground dark:text-muted-foreground" />
                    ) : (
                      <Trash2Icon className="size-4" />
                    )}
                    Delete Account
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

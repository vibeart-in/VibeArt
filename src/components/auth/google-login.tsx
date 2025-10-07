"use client";
import { Button } from "@/src/components/ui/button";
import { createClient } from "@/src/lib/supabase/client";
import Image from "next/image";
import React from "react";

const SignInWithGoogleButton = () => {
  const signInWithGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/image/generate`,
      },
    });
  };

  return (
    <Button
      type="button"
      className="flex w-full items-center justify-center gap-4 rounded-xl border border-[#313131] bg-black/90 p-6 text-sm text-white focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      onClick={signInWithGoogle}
    >
      <Image
        src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/Google_Favicon_2025.webp"
        alt="Google logo"
        className="h-4 w-4"
        width={25}
        height={25}
      />
      Continue with Google
    </Button>
  );
};

export default SignInWithGoogleButton;

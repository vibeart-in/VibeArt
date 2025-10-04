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
      className="p-6 w-full flex items-center justify-center rounded-xl gap-4 text-sm text-white bg-black/90 border border-[#313131] focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      onClick={signInWithGoogle}
    >
      <Image
        src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/Google_Favicon_2025.webp"
        alt="Google logo"
        className="w-4 h-4"
        width={25}
        height={25}
      />
      Continue with Google
    </Button>
  );
};

export default SignInWithGoogleButton;

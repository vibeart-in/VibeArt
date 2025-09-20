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
      className="p-6 w-full flex items-center rounded-xl gap-2 text-sm text-white bg-black/50 border border-[#313131] focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      onClick={signInWithGoogle}
    >
      <Image
        src="/images/Google_Favicon_2025.png"
        alt="Google logo"
        width={15}
        height={15}
      />
      Continue with Google
    </Button>
  );
};

export default SignInWithGoogleButton;

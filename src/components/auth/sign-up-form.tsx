"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Input } from "@/src/components/ui/input";
import { createClient } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";

import SignInWithGoogleButton from "./google-login";
import { Button } from "../ui/button";
import GlassModal from "../ui/GlassModal";
import { NavbarLogo } from "../ui/resizable-navbar";

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/onboarding`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex size-full items-center justify-center">
      <GlassModal width={40} height={650} count={16} className="z-10 hidden md:flex" />
      <GlassModal width="90vw" height={550} count={1} className="z-10 md:hidden" />

      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div
          className={cn("flex w-[80vw] max-w-sm flex-col gap-6 md:w-full", className)}
          {...props}
        >
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <NavbarLogo className="mb-2" />
            <div>
              <h2 className="text-center text-2xl font-bold">Start Creating 🔥</h2>
              <p className="mt-1 text-sm text-gray-400">
                Log in to generate, edit and bring your vison to life
              </p>
            </div>
          </div>
          <SignInWithGoogleButton />
          <div className="border-b border-gray-500"></div>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <Input
                  id="repeat-password"
                  type="password"
                  placeholder="Repeat Password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating an account..." : "Sign up and start creating"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="inline-block text-sm text-[#95A4FC] underline underline-offset-4 transition-colors hover:text-[#7b8be6]"
              >
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { createClient } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";

import SignInWithGoogleButton from "./google-login";
import GlassModal from "../ui/GlassModal";
import { NavbarLogo } from "../ui/resizable-navbar";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/image");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex size-full items-center justify-center">
      <GlassModal width={40} height={550} count={16} className="z-50" />

      <div className="absolute z-50">
        <div
          className={cn("flex w-full max-w-sm flex-col items-center gap-6 text-center", className)}
          {...props}
        >
          <NavbarLogo />
          <div>
            <h2 className="text-2xl font-bold">Start Creating 🔥</h2>
            <p className="mt-1 text-sm text-gray-400">
              Log in to generate, edit and bring your vison to life
            </p>
          </div>

          <SignInWithGoogleButton />

          <div className="relative flex w-full items-center">
            <span className="flex-grow border-t border-gray-500"></span>
            <span className="mx-2 text-xs text-gray-400">or</span>
            <span className="flex-grow border-t border-gray-500"></span>
          </div>

          <form onSubmit={handleLogin} className="flex w-full flex-col gap-4">
            <Input
              id="email"
              type="email"
              placeholder="Your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              type="password"
              required
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login & Start Creating"}
            </Button>
          </form>
          <div className="mt-2 flex justify-center gap-4 text-sm">
            <Link
              href="/auth/signup"
              className="text-[#95A4FC] underline-offset-4 transition-colors hover:text-[#7b8be6] hover:underline"
            >
              Sign up
            </Link>
            <Link
              href="/forgot-password"
              className="text-[#95A4FC] underline-offset-4 transition-colors hover:text-[#7b8be6] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

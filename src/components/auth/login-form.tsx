"use client";

import { cn } from "@/src/lib/utils";
import { createClient } from "@/src/lib/supabase/client";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SignInWithGoogleButton from "./google-login";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
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
      router.push("/image/generate");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <h2 className="font-semibold text-center text-xl">Login Now</h2>
      <SignInWithGoogleButton />
      <div className="border-b border-gray-500"></div>
      <form onSubmit={handleLogin}>
        <div className="flex flex-col gap-6">
          <div className="">
            {/* <Label htmlFor="email">Email</Label> */}
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="">
            <div className="flex items-center">
              {/* <Label htmlFor="password">Password</Label> */}
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-64" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm flex justify-center gap-4">
          <Link
            href="/auth/signup"
            className="text-[#95A4FC] underline-offset-4 hover:text-[#7b8be6] transition-colors hover:underline"
          >
            Sign up
          </Link>
          <Link
            href="/forgot-password"
            className="inline-block text-sm underline-offset-4 hover:underline text-[#95A4FC] hover:text-[#7b8be6] transition-colors"
          >
            Forgot your password?
          </Link>
        </div>
      </form>
    </div>
  );
}

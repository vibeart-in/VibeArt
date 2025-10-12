"use client";
import { useRouter } from "next/navigation";

import { createClient } from "@/src/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return <p onClick={logout}>Logout</p>;
}

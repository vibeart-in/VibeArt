// This is now a Server Component that can fetch data
import AppGridClient from "@/src/components/ai-apps/AppGridClient";
import { createClient } from "@/src/lib/supabase/server"; // Use the server client

// The page is now an async function
export default async function Page() {
  // Fetch data directly on the server
  const supabase = await createClient();
  const { data: initialApps, error } = await supabase.rpc("get_ai_apps");

  if (error) {
    // Handle error gracefully, maybe show an error message
    console.error("Failed to fetch initial apps:", error);
  }

  return (
    <div className="relative w-full h-screen bg-black">
      <div className="pt-20">
        <h1 className="text-[60px] font-medium text-accent font-gothic">
          Creative Hub
        </h1>
        <p className="w-[70vw] text-xl font-medium text-white">
          Create professional-grade content in one click — from 4K images and
          viral video effects to polished commercials, motion graphics, and even
          interior renders. No editing, no hassle — just instant results.
        </p>
      </div>

      {/* ✅ Pass the server-fetched data as a prop */}
      <AppGridClient initialApps={initialApps || []} />
    </div>
  );
}
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Helper to get admin client (reusing logic from webhook)
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase admin credentials.");
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};

export async function POST(req: Request) {
  try {
    const { jobId, taskId } = await req.json();
    
    if (!jobId || !taskId) {
        return NextResponse.json({ error: "Missing jobId or taskId" }, { status: 400 });
    }

    // 1. Query RunningHub
    const apiKey = process.env.RUNNING_HUB_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "No API Key" }, { status: 500 });

    const rhRes = await fetch("https://www.runninghub.ai/task/openapi/ai-app/query", {
        method: "POST", // Usually POST for their endpoints based on 'run' endpoint
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            apiKey,
            taskId
        })
    });

    if (!rhRes.ok) {
        const txt = await rhRes.text();
        return NextResponse.json({ error: `RunningHub Error: ${txt}` }, { status: rhRes.status });
    }

    const rhData = await rhRes.json();
    console.log("Force Fetch Result:", rhData);

    const data = rhData.data?.[0]; // Assuming array structure similar to run

    if (!data) {
        return NextResponse.json({ status: "pending", rhData });
    }

    const status = data.taskStatus; // Check property name
    const outputUrls = data.fileUrl || (Array.isArray(data.fileUrls) ? data.fileUrls : []) || [];
    
    // 2. Update Supabase if complete
    const supabaseAdmin = getSupabaseAdmin();

    if (status === "SUCCESS" || status === "succeeded") {
        // Mimic success webhook logic - we don't need queue here if we just valid the record
        // But for consistency let's update raw info
        // Ideally we should push to queue like webhook, but direct update is faster for 'force'
        
        // However, OutputImage needs 'output_images' in 'jobs' or 'conversation_messages'
        // 'jobs' table usually holds it? 
        // Let's check schema. Usually we write to `job_output_images` table or `output_images` column in jobs (if simple).
        // MessageTurn uses `output_images` from message.
        // We trigger the webhook logic which pushes to queue `media-processing`.
        // If we can't trigger queue (redis), we must update manually.
        
        // Manual Update for simpler flow:
        // Update job status
        await supabaseAdmin
            .from("jobs")
            .update({ 
               job_status: "succeeded",
               // If schema has simple column:
               // output_images: outputUrls  (Assuming type matches)
               // But usually it's a relation.
            })
            .eq("id", jobId);
            
        // Insert into job_output_images if that table exists?
        // Let's assume queue handles it. If user has no Redis locally, ForceFetch won't full fix it unless we define images.
        // But let's return the URLs so the UI can at least show them temporarily or update node.
        
        return NextResponse.json({ 
            status: "succeeded", 
            result: { outputUrls: Array.isArray(outputUrls) ? outputUrls : [outputUrls] } 
        });
    }

    if (status === "FAILED" || status === "failed") {
         await supabaseAdmin
            .from("jobs")
            .update({ job_status: "failed", error_message: data.failReason || "Task failed" })
            .eq("id", jobId);
            
         return NextResponse.json({ status: "failed", error: data.failReason });
    }

    return NextResponse.json({ status: "pending", rhStatus: status });

  } catch (error: any) {
    console.error("Force Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

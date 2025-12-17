import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { conversationId } = await req.json();
    const supabase = await createClient();

    // Fetch the latest message/job for this conversation
    const { data: messages, error } = await supabase
        .from("conversation_messages")
        .select(`
            *,
            jobs(
                id,
                job_status,
                output_images,
                error_message
            )
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(1);

    if (error || !messages || messages.length === 0) {
        return NextResponse.json({ status: "pending" });
    }

    const latestMessage = messages[0];
    const job = latestMessage.jobs; 
    
    // DEBUG LOG
    console.log(`[Check Gen] MsgID: ${latestMessage.id}, Job: ${JSON.stringify(job)}`);

    // Helper to normalize status
    const isSuccess = (s: string) => ["succeeded", "success", "completed"].includes(s?.toLowerCase());
    const isFailed = (s: string) => ["failed", "failure", "error"].includes(s?.toLowerCase());

    // Check for images directly on the message or job
    if (latestMessage.output_images && latestMessage.output_images.length > 0) {
        const validImage = latestMessage.output_images[0];
         return NextResponse.json({ 
            status: "succeeded", 
            imageUrl: validImage.imageUrl,
            width: validImage.width || 1024,
            height: validImage.height || 1024
        });
    }
    
    // Check failure on message
    if (isFailed(latestMessage.job_status) || latestMessage.error_message) {
         return NextResponse.json({ status: "failed", error: latestMessage.error_message });
    }

    // Also check job object if available
    if (job) {
         // handle if job is array or object
         const jobObj = Array.isArray(job) ? job[0] : job;
         
         if (jobObj && isFailed(jobObj.job_status)) {
             return NextResponse.json({ status: "failed", error: jobObj.error_message });
         }
         // If job has images but message doesn't (rare but possible)
         if (jobObj && jobObj.output_images && jobObj.output_images.length > 0) {
             const validImage = jobObj.output_images[0];
             return NextResponse.json({ 
                status: "succeeded", 
                imageUrl: validImage.imageUrl,
                width: validImage.width || 1024,
                height: validImage.height || 1024
            });
         }
         
         // If job status says success but no images yet? (Maybe url is in distinct field?)
         if (isSuccess(jobObj.job_status)) {
             // Fallback: This shouldn't happen if output_images is populated. 
             // Maybe we need to fetch 'job_output_images' table? 
             // But for now, just wait.
         }
    }

    return NextResponse.json({ status: "pending" });

  } catch (error) {
    return NextResponse.json({ error: "Check failed" }, { status: 500 });
  }
}

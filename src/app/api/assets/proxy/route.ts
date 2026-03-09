import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_REGION ?? "auto",
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = "thumbnail";
const ALLOWED_MIMES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    // Basic path traversal protection
    if (key.includes("..")) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    const s3Response = await s3Client.send(command);

    if (!s3Response.Body) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    const contentType = ALLOWED_MIMES[ext] ?? s3Response.ContentType ?? "application/octet-stream";

    const bodyBytes = await s3Response.Body.transformToByteArray();

    return new NextResponse(bodyBytes as any, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Asset proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
  }
}

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
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

export interface AssetItem {
  key: string;
  /** Proxy URL served via /api/assets/proxy?key=... — works regardless of bucket ACL */
  url: string;
  name: string;
  folder: string;
  size: number;
  lastModified: Date | undefined;
  type: "image" | "video" | "other";
}

export interface AssetsResponse {
  folders: string[];
  assets: AssetItem[];
  error?: string;
}

function getMediaType(key: string): "image" | "video" | "other" {
  const lowerKey = key.toLowerCase();
  if (lowerKey.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif|tiff?)$/)) return "image";
  if (lowerKey.match(/\.(mp4|mov|webm|avi|mkv|m4v|flv)$/)) return "video";
  return "other";
}

function buildProxyUrl(key: string, origin: string): string {
  return `${origin}/api/assets/proxy?key=${encodeURIComponent(key)}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const folder = searchParams.get("folder") ?? "";

    const prefix = folder ? `${folder}/` : "";

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      Delimiter: "/",
    });

    const response = await s3Client.send(command);

    // Collect folder names (common prefixes)
    const folders = (response.CommonPrefixes ?? [])
      .map((cp) => cp.Prefix?.replace(/\/$/, "") ?? "")
      .filter(Boolean);

    // Collect actual files with proxy URLs
    const assets: AssetItem[] = (response.Contents ?? [])
      .filter((obj) => obj.Key && !obj.Key.endsWith("/"))
      .map((obj) => {
        const key = obj.Key!;
        const name = key.split("/").pop() ?? key;
        const folderName = key.includes("/") ? key.split("/").slice(0, -1).join("/") : "";
        return {
          key,
          url: buildProxyUrl(key, origin),
          name,
          folder: folderName,
          size: obj.Size ?? 0,
          lastModified: obj.LastModified,
          type: getMediaType(key),
        };
      });

    return NextResponse.json({ folders, assets } satisfies AssetsResponse);
  } catch (error) {
    console.error("Tigris assets error:", error);
    return NextResponse.json(
      { folders: [], assets: [], error: "Failed to load assets" } satisfies AssetsResponse,
      { status: 500 },
    );
  }
}

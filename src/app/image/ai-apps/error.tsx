"use client";
export default function Error({ error }: { error: Error }) {
  return <p className="text-center">Failed to load images. Please try again later.</p>;
}
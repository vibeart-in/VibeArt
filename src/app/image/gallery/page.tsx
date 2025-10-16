import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { cookies } from "next/headers";

import { getGalleryImages } from "@/src/actions/gallery/actions";
import ImageGalleryWrapper from "@/src/components/gallery/ImageGalleryWrapper";
import { createClient } from "@/src/lib/supabase/server";

export default async function GalleryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>Please log in to view your gallery.</p>;
  }

  const queryClient = new QueryClient();

  // Prefetch the first page of data using the server action
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["images", user.id],
    queryFn: () => getGalleryImages({ pageParam: 0 }),
    initialPageParam: 0,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Pass the userId to the client component for subsequent fetches */}
      <ImageGalleryWrapper userId={user.id} />
    </HydrationBoundary>
  );
}

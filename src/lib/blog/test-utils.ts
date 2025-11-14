// Temporary test file to verify blog utilities
import { getAllPosts, getPostBySlug, getPublishedPosts } from "./posts";

export function testBlogUtilities() {
  console.log("Testing blog utilities...\n");

  // Test getAllPosts
  const allPosts = getAllPosts();
  console.log(`Total posts found: ${allPosts.length}`);

  if (allPosts.length > 0) {
    console.log("\nFirst post:");
    console.log(`- Slug: ${allPosts[0].slug}`);
    console.log(`- Title: ${allPosts[0].title}`);
    console.log(`- Reading time: ${allPosts[0].readingTime} min`);
    console.log(`- Excerpt: ${allPosts[0].excerpt}`);
    console.log(`- Published: ${allPosts[0].published}`);

    // Test getPostBySlug
    const post = getPostBySlug(allPosts[0].slug);
    console.log(`\ngetPostBySlug test: ${post ? "✓ Success" : "✗ Failed"}`);

    // Test getPublishedPosts
    const publishedPosts = getPublishedPosts();
    console.log(`Published posts: ${publishedPosts.length}`);
  }

  console.log("\n✓ All tests completed");
}

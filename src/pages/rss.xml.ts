import rss from "@astrojs/rss";
import { site } from "@config/site";
import { getPosts } from "@core/content/posts";

export async function GET(context: any) {
  let posts: any[] = [];
  try {
    const allPosts = await getPosts();
    posts = allPosts.filter((p) => p.status === "published");
  } catch {
    posts = [];
  }

  return rss({
    title: site.name,
    description: site.description,
    site: context.site || site.url,
    items: posts.map((post) => ({
      title: post.title,
      pubDate: new Date(post.published_at),
      description: post.excerpt,
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>${site.language || "id"}</language>`,
  });
}

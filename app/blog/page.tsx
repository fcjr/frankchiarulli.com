import Link from "../Link";
import { getPosts, Post } from "../posts";

export const metadata = {
  title: "Blog - Frank Chiarulli Jr.",
  description: "All blog posts by Frank Chiarulli Jr.",
};

export default async function BlogPage() {
  const posts = await getPosts();
  
  return (
    <div className="flex flex-col gap-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-headline mb-4">Blog</h1>
        <p className="text-paragraph">
          Thoughts on privacy, security, programming, and building better software.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link
              key={post.slug}
              className="block hover:opacity-70 transition-opacity"
              href={"/blog/" + post.slug + "/"}
            >
              <article className="pb-6 border-b border-stroke/20 last:border-b-0">
                <PostTitle post={post} />
                <PostMeta post={post} />
                <PostSubtitle post={post} />
              </article>
            </Link>
          ))
        ) : (
          <p className="text-paragraph italic">No posts yet. Check back soon!</p>
        )}
      </div>
    </div>
  );
}

function PostTitle({ post }: { post: Post }) {
  return (
    <h2 className="text-2xl font-semibold text-headline mb-2 leading-tight">
      {post.title}
    </h2>
  );
}

function PostMeta({ post }: { post: Post }) {
  return (
    <p className="text-sm text-paragraph mb-3">
      {new Date(post.date).toLocaleDateString("en", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </p>
  );
}

function PostSubtitle({ post }: { post: Post }) {
  return <p className="text-paragraph leading-relaxed">{post.spoiler}</p>;
}
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
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-paragraph hover:text-secondary text-sm font-medium transition-colors duration-200 group"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
          <span>home</span>
        </Link>
      </div>
      <header>
        <h1 className="text-4xl font-bold text-headline mb-3 tracking-tight">Blog</h1>
        <p className="text-paragraph">
          Privacy, security, programming, and building things.
        </p>
      </header>

      <hr className="glow-divider" />

      <div className="flex flex-col gap-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link
              key={post.slug}
              className="card block p-5 group"
              href={"/blog/" + post.slug + "/"}
            >
              <article>
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
    <h2 className="text-xl font-bold text-headline group-hover:text-secondary mb-1 leading-tight transition-colors">
      {post.title}
    </h2>
  );
}

function PostMeta({ post }: { post: Post }) {
  return (
    <p className="text-xs text-paragraph mb-2 uppercase tracking-wider">
      {new Date(post.date.replace(/-/g, "/")).toLocaleDateString("en", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </p>
  );
}

function PostSubtitle({ post }: { post: Post }) {
  return <p className="text-paragraph text-sm leading-relaxed">{post.spoiler}</p>;
}

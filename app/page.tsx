import Link from "./Link";
import Color from "colorjs.io";
import { metadata, getPosts, Post } from "./posts";

export { metadata };

export default async function Home() {
  const posts = await getPosts();
  return (
    <div className="flex flex-col gap-12">
      <section className="mb-8">
        <p className="text-lg text-gray-900 mb-4">
          Hi, I'm Frank! I write code that keeps you safe and private online.
        </p>
        <p className="text-gray-700 mb-3">
          I'm a software engineer passionate about privacy, security, embedded systems, and open source. 
          I work with Go, TypeScript, Python, Java, Kotlin, Swift, and I'm currently learning Rust.
        </p>
        <p className="text-gray-700 mb-3">
          Currently, I'm a tech lead at JPMorgan Chase's Global Business Accelerator, focusing on privacy and security. 
          Previously, I was a founding engineer at Svix and lead backend engineer at Ghostery/Cliqz, working on anti-tracking software.
        </p>
        <p className="text-gray-600 text-sm italic">
          Probably doing something I shouldn't with cGo or WinAPI.
        </p>
      </section>
      
      {posts.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Posts</h2>
          {posts.map((post) => (
            <Link
              key={post.slug}
              className="block hover:opacity-70 transition-opacity mb-8"
              href={"/blog/" + post.slug + "/"}
            >
              <article>
                <PostTitle post={post} />
                <PostMeta post={post} />
                <PostSubtitle post={post} />
              </article>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

function PostTitle({ post }: { post: Post }) {
  return (
    <h2 className="text-2xl font-semibold text-gray-900 mb-2 leading-tight">
      {post.title}
    </h2>
  );
}

function PostMeta({ post }: { post: Post }) {
  return (
    <p className="text-sm text-gray-600 mb-1">
      {new Date(post.date).toLocaleDateString("en", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </p>
  );
}

function PostSubtitle({ post }: { post: Post }) {
  return <p className="text-gray-700 leading-relaxed">{post.spoiler}</p>;
}

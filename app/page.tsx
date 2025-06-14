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
          I'll be attending the Summer 2 batch of <Link href="https://www.recurse.com/" className="text-blue-600 hover:text-blue-800 underline">Recurse Center</Link> starting June 30th, having recently left my role as tech lead and engineering manager at <Link href="https://www.jpmorganchase.com/" className="text-blue-600 hover:text-blue-800 underline">JPMorgan Chase</Link>'s Global Business Accelerator. 
          Previously, I was a founding engineer at <Link href="https://www.svix.com/" className="text-blue-600 hover:text-blue-800 underline">Svix</Link> (YC W21) and lead backend/desktop engineer at <Link href="https://www.ghostery.com/" className="text-blue-600 hover:text-blue-800 underline">Ghostery</Link>/<Link href="https://cliqz.com/" className="text-blue-600 hover:text-blue-800 underline">Cliqz</Link>, working on anti-tracking software.
        </p>
        <p className="text-gray-600 text-sm italic">
          Probably doing something I shouldn't with cGo or WinAPI.
        </p>
      </section>
      
      {posts.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Latest Post</h2>
            <Link
              className="block hover:opacity-70 transition-opacity mb-8"
              href={"/blog/" + posts[0].slug + "/"}
            >
              <article>
                <PostTitle post={posts[0]} />
                <PostMeta post={posts[0]} />
                <PostSubtitle post={posts[0]} />
              </article>
            </Link>
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

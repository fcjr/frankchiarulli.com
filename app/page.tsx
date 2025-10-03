import Link from "./Link";
import Color from "colorjs.io";
import { metadata, getPosts, Post } from "./posts";

export { metadata };

export default async function Home() {
  const posts = await getPosts();
  return (
    <div className="flex flex-col gap-6">
      <section className="mb-4">
        <p className="text-lg text-headline mb-3">
          Hi, I'm Frank! I write code that keeps you safe and private online.
        </p>
        <p className="text-paragraph mb-2">
          I'm a software engineer passionate about privacy, security, embedded systems, and open source.
          I work mostly with Go, TypeScript, Python, Java, Kotlin, Swift, and I'm currently learning Rust.
          I recently started operating my own ASN <Link href="https://www.peeringdb.com/asn/402030" className="text-headline hover:text-stroke underline">AS402030</Link> to learn more about BGP and peering.
        </p>
        <p className="text-paragraph mb-2">
          I am currently attending the <s>Summer 2</s> Fall 2 (I extended 🙈) batch of <Link href="https://www.recurse.com/" className="text-headline hover:text-stroke underline">Recurse Center</Link>, having recently left my role as tech lead and engineering manager at <Link href="https://www.jpmorganchase.com/" className="text-headline hover:text-stroke underline">JPMorgan Chase</Link>'s Global Business Accelerator.
          Previously, I was a founding engineer at <Link href="https://www.svix.com/" className="text-headline hover:text-stroke underline">Svix</Link> (YC W21) and lead backend/desktop engineer at <Link href="https://www.ghostery.com/" className="text-headline hover:text-stroke underline">Ghostery</Link>/<Link href="https://cliqz.com/" className="text-headline hover:text-stroke underline">Cliqz</Link>, working on anti-tracking software.
        </p>
        <p className="text-paragraph text-sm italic">
          Probably doing something I shouldn't with cGo or WinAPI.
        </p>
      </section>

      {posts.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-headline mb-3">Latest Post</h2>
            <Link
              className="block hover:opacity-70 transition-opacity mb-4"
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
    <h2 className="text-xl font-semibold text-headline mb-1 leading-tight">
      {post.title}
    </h2>
  );
}

function PostMeta({ post }: { post: Post }) {
  return (
    <p className="text-sm text-paragraph mb-1">
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

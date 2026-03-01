import Link from "./Link";
import { sans } from "./fonts";
import { metadata, getPosts, Post } from "./posts";

export { metadata };

export default async function Home() {
  const posts = await getPosts();
  return (
    <div className="flex flex-col gap-3">
      {/* Hero */}
      <section>
        <h1 className={`hero-title mb-2 ${sans.className}`}>
          <span className="glitch-wrap" data-text="Frank">
            Frank
          </span>
          <br />
          <span className="glitch-wrap" data-text="Chiarulli Jr">
            Chiarulli Jr
          </span>
          <span className="text-secondary">.</span>
        </h1>
        <p className="text-headline max-w-xl">
          Software engineer and artist building at the edge of privacy, security, and open source.
        </p>
      </section>

      <hr className="glow-divider" style={{ margin: '0.25rem 0' }} />

      {/* Bio — compact */}
      <section className="max-w-xl text-sm leading-relaxed">
        <p className="text-paragraph mb-2">
          I write Go, TypeScript, Python, Kotlin, and Swift — currently learning Rust.
          I also make <Link href="/art" className="neon-link">sculpture, photography, and installations</Link>.
          Currently at <Link href="https://www.recurse.com/" className="neon-link">Recurse Center</Link>.
          Previously <Link href="https://www.jpmorganchase.com/" className="neon-link">JPMorgan Chase</Link>,{" "}
          <Link href="https://www.svix.com/" className="neon-link">Svix</Link> (YC W21),{" "}
          <Link href="https://www.ghostery.com/" className="neon-link">Ghostery</Link>/<Link href="https://cliqz.com/" className="neon-link">Cliqz</Link>.
        </p>
      </section>

      {/* Inline links */}
      <nav className="flex gap-3 text-xs">
        <Link href="/blog" className="card inline-block px-4 py-2 group">
          <span className="text-headline font-semibold group-hover:text-secondary transition-colors">Blog</span>
        </Link>
        <Link href="/art" className="card inline-block px-4 py-2 group">
          <span className="text-headline font-semibold group-hover:text-secondary transition-colors">Art</span>
        </Link>
        {posts.length > 0 && (
          <Link href={"/blog/" + posts[0].slug + "/"} className="card inline-block px-4 py-2 group">
            <span className="text-tertiary font-semibold group-hover:text-secondary transition-colors">Latest Post: {posts[0].title}</span>
          </Link>
        )}
      </nav>
    </div>
  );
}

import Link from "./Link";
import { sans } from "./fonts";
import { metadata, getPosts } from "./posts";
import { products, builds, consulting, Project } from "./projects";

export { metadata };

export default async function Home() {
  const posts = await getPosts();
  const latest = posts[0];

  return (
    <div className="home-page flex flex-col">
      {/* Hero */}
      <section>
        <h1 className={`hero-title mb-1 ${sans.className}`}>
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
          <span className="term-cursor" aria-hidden="true" />
        </p>
      </section>

      <hr className="glow-divider" style={{ margin: "0.5rem 0 0.4rem" }} />

      {/* Bio — compact */}
      <section className="max-w-xl text-sm leading-relaxed">
        <p className="text-paragraph">
          I build across the whole stack, hardware to frontend, in whatever language a problem needs: Go, TypeScript, Python, Rust, Kotlin, Swift.
          I also make <Link href="/art" className="neon-link">sculpture, photography, and installations</Link>.
          I operate my own ASN <Link href="https://www.peeringdb.com/asn/402030" className="neon-link">AS402030</Link>.
          Previously <Link href="https://www.recurse.com/" className="neon-link">Recurse Center</Link>,{" "}
          <Link href="https://www.jpmorganchase.com/" className="neon-link">JPMorgan Chase</Link>,{" "}
          <Link href="https://www.svix.com/" className="neon-link">Svix</Link> (YC W21),{" "}
          <Link href="https://www.ghostery.com/" className="neon-link">Ghostery</Link>/<Link href="https://cliqz.com/" className="neon-link">Cliqz</Link>.
        </p>
      </section>

      {/* Writing */}
      <section className="reg-section">
        <div className="reg-head">
          <span className={`reg-path ${sans.className}`}>~/writing</span>
          <span className="reg-lead" aria-hidden="true" />
          <Link href="/blog" className={`reg-meta ${sans.className}`}>
            view all <span className="reg-meta-arrow">→</span>
          </Link>
        </div>
        {latest && (
          <Link href={"/blog/" + latest.slug + "/"} className="reg-item reg-feature group">
            <span className="reg-feature-top">
              <span className="reg-caret" aria-hidden="true">›</span>
              <span className={`reg-name ${sans.className}`}>{latest.title}</span>
              <span className="reg-arrow" aria-hidden="true">→</span>
            </span>
            <span className="reg-desc">{latest.spoiler}</span>
          </Link>
        )}
      </section>

      <Registry path="~/building" projects={products} />
      <Registry path="~/consulting" projects={consulting} />
      <Registry path="~/builds" projects={builds} viewAllHref="https://github.com/fcjr" />
    </div>
  );
}

function Registry({
  path,
  projects,
  viewAllHref,
}: {
  path: string;
  projects: Project[];
  viewAllHref?: string;
}) {
  return (
    <section className="reg-section">
      <div className="reg-head">
        <span className={`reg-path ${sans.className}`}>{path}</span>
        <span className="reg-lead" aria-hidden="true" />
        {viewAllHref ? (
          <Link href={viewAllHref} className={`reg-meta ${sans.className}`}>
            view all <span className="reg-meta-arrow">→</span>
          </Link>
        ) : (
          <span className={`reg-meta ${sans.className}`}>
            {String(projects.length).padStart(2, "0")}
          </span>
        )}
      </div>
      <div>
        {projects.map((project) => (
          <RegistryRow key={project.url} project={project} />
        ))}
      </div>
    </section>
  );
}

function RegistryRow({ project }: { project: Project }) {
  const internal = project.url.startsWith("/");
  return (
    <Link href={project.url} className="reg-item reg-row group">
      <span className="reg-caret" aria-hidden="true">›</span>
      <span className={`reg-name ${sans.className}`}>{project.name}</span>
      <span className="reg-desc">{project.tagline}</span>
      <span className="reg-arrow" aria-hidden="true">{internal ? "→" : "↗"}</span>
    </Link>
  );
}

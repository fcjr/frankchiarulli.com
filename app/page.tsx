import Link from "./Link";
import SputnikCanvas from "./SputnikCanvas";
import HeroTitle from "./HeroTitle";
import { metadata, getPosts } from "./posts";
import { products, builds, consulting, Project } from "./projects";

export { metadata };

export default async function Home() {
  const posts = await getPosts();
  const latest = posts[0];

  return (
    <div className="home-page flex flex-col">
      {/* Hero */}
      <section className="hero">
        <SputnikCanvas />
        <HeroTitle />
        <p className="hero-sub">
          Software engineer and artist building at the edge of privacy, security, and open source.
        </p>
      </section>

      <hr className="glow-divider" style={{ margin: "1.4rem 0 1.2rem" }} />

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
          <span className="reg-path">~/writing</span>
          <span className="reg-lead" aria-hidden="true" />
          <Link href="/blog" className="reg-meta">
            view all <span className="reg-meta-arrow">→</span>
          </Link>
        </div>
        {latest && (
          <div className="reg-list">
            <Link href={"/blog/" + latest.slug + "/"} className="reg-item reg-feature group">
              <span className="reg-feature-top">
                <span className="reg-caret" aria-hidden="true">›</span>
                <span className="reg-name">{latest.title}</span>
                <span className="reg-arrow" aria-hidden="true">→</span>
              </span>
              <span className="reg-desc">{latest.spoiler}</span>
            </Link>
          </div>
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
        <span className="reg-path">{path}</span>
        <span className="reg-lead" aria-hidden="true" />
        {viewAllHref ? (
          <Link href={viewAllHref} className="reg-meta">
            view all <span className="reg-meta-arrow">→</span>
          </Link>
        ) : (
          <span className="reg-meta">
            {String(projects.length).padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="reg-list">
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
      <span className="reg-name">{project.name}</span>
      <span className="reg-desc">{project.tagline}</span>
      <span className="reg-arrow" aria-hidden="true">{internal ? "→" : "↗︎"}</span>
    </Link>
  );
}

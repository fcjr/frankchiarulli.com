import Link from "./Link";
import HomeLink from "./HomeLink";

import Footer from "./Footer";
import { sans, display } from "./fonts";
import { getPosts } from "./posts";
import "./global.css";

export const metadata = {
  metadataBase: new URL("https://frankchiarulli.com"),
};

const Activity: any = Symbol.for("react.activity");

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [latest] = await getPosts();

  return (
    <html lang="en" className={`${sans.className} ${display.variable}`} suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Frank Chiarulli Jr. — RSS"
          href="https://frankchiarulli.com/blog/rss.xml"
        />
        <link
          rel="alternate"
          type="application/atom+xml"
          title="Frank Chiarulli Jr. — Atom"
          href="https://frankchiarulli.com/blog/atom.xml"
        />
      </head>
      <body className="text-paragraph antialiased bg-background">
        <div className="grid-bg" aria-hidden="true" />
        <div className="noise" aria-hidden="true" />

        <div className="app-shell relative z-10">
          <div className="app-main sheet mx-auto max-w-3xl px-6 pt-5 pb-6 w-full">
            <header className="mb-6 flex items-start justify-between gap-4">
              <HomeLink />
              <nav className="flex gap-1 items-center flex-wrap pt-1">
                <Link href="/blog" className="nav-link">Blog</Link>
                <Link href="/art" className="nav-link">Art</Link>
                <Link href="/press" className="nav-link">Media</Link>
                <Link href="https://github.com/fcjr" target="_blank" className="nav-link">GitHub</Link>
                <Link href="https://linkedin.com/in/frankchiarulli" target="_blank" className="nav-link">LinkedIn</Link>
                <Link href="https://bsky.app/profile/frankchiarulli.com" target="_blank" className="nav-link">Bluesky</Link>
                <Link href="https://x.com/_fcjr" target="_blank" className="nav-link">X</Link>
                <Link href="mailto:frank@frankchiarulli.com" className="nav-link">Email</Link>
                <Link href="/blog/rss.xml" title="RSS Feed" aria-label="RSS Feed" className="nav-link">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M4 11a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="square" strokeLinejoin="miter"/>
                    <path d="M4 4a16 16 0 0 1 16 16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="square" strokeLinejoin="miter"/>
                    <rect x="3.5" y="17.5" width="3" height="3" fill="currentColor"/>
                  </svg>
                </Link>
              </nav>
            </header>

            <main className="relative z-20">
              <Activity mode="visible">{children}</Activity>
            </main>
            <span className="sheet-b" aria-hidden="true" />
          </div>
          <Footer latest={latest ? { title: latest.title, href: "/blog/" + latest.slug + "/" } : undefined} />
        </div>
      </body>
    </html>
  );
}

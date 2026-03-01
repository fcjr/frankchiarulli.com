import Link from "./Link";
import HomeLink from "./HomeLink";
import RecurseRing from "./RecurseRing";
import RCScout from "./RCScout";
import ThemeToggle from "./ThemeToggle";
import ThemeScript from "./ThemeScript";
import Footer from "./Footer";
import { sans } from "./fonts";
import "./global.css";

export const metadata = {
  metadataBase: new URL("https://frankchiarulli.com"),
};

const Activity: any = Symbol.for("react.activity");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.className} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="text-paragraph antialiased bg-background">
        <div className="grid-bg" aria-hidden="true" />
        <div className="noise" aria-hidden="true" />
        <div className="scanlines" aria-hidden="true" />

        <div className="relative z-10">
          <div className="mx-auto max-w-3xl px-6 pt-4 pb-2 w-full">
            <header className="mb-4 flex items-start justify-between gap-4">
              <HomeLink />
              <nav className="flex gap-3 items-center flex-wrap pt-1">
                <Link href="/blog" className="nav-link">Blog</Link>
                <Link href="/art" className="nav-link">Art</Link>
                <Link href="https://github.com/fcjr" target="_blank" className="nav-link">GitHub</Link>
                <Link href="https://linkedin.com/in/frankchiarulli" target="_blank" className="nav-link">LinkedIn</Link>
                <Link href="https://bsky.app/profile/frankchiarulli.com" target="_blank" className="nav-link">Bluesky</Link>
                <Link href="https://x.com/_fcjr" target="_blank" className="nav-link">X</Link>
                <Link href="mailto:frank@frankchiarulli.com" className="nav-link">Email</Link>
                <Link href="/blog/rss.xml" title="RSS Feed" aria-label="RSS Feed" className="nav-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M4 11a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 4a16 16 0 0 1 16 16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="5" cy="19" r="1" fill="currentColor"/>
                  </svg>
                </Link>
                <ThemeToggle />
              </nav>
            </header>

            <main className="relative z-20">
              <Activity mode="visible">{children}</Activity>
            </main>

            <div className="mt-2 relative z-20">
              <RCScout />
              <RecurseRing />
            </div>
          </div>

          {/* Scene flows directly after content — no tricks */}
          <Footer />
        </div>
      </body>
    </html>
  );
}

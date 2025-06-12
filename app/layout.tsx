import PlausibleProvider from "next-plausible";
import Link from "./Link";
import HomeLink from "./HomeLink";
import { sans } from "./fonts";
import "./global.css";

export const metadata = {
  metadataBase: new URL("https://frankchiarulli.com"),
};

const Activity: any = Symbol.for("react.activity");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.className}>
      <body className="mx-auto max-w-2xl bg-white px-6 py-16 text-gray-900 antialiased">
        <PlausibleProvider domain="frankchiarulli.com">
          <header className="mb-16">
            <HomeLink />
            <nav className="mt-4 flex gap-4 text-sm text-gray-600 items-center">
              <Link href="/blog">Blog</Link>
              <Link href="https://github.com/fcjr" target="_blank">GitHub</Link>
              <Link href="https://linkedin.com/in/frankchiarulli" target="_blank">LinkedIn</Link>
              <Link href="https://twitter.com/_fcjr" target="_blank">Twitter</Link>
              <Link href="mailto:frank@frankchiarulli.com">Email</Link>
              <Link href="/blog/rss.xml" title="RSS Feed">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 11a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 4a16 16 0 0 1 16 16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="5" cy="19" r="1" fill="currentColor"/>
                </svg>
              </Link>
            </nav>
          </header>
          <main>
            <Activity mode="visible">{children}</Activity>
          </main>
        </PlausibleProvider>
      </body>
    </html>
  );
}

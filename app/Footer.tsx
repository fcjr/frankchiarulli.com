"use client";

import Link from "./Link";
import RCScout from "./RCScout";
import RecurseRing from "./RecurseRing";

export default function Footer({ latest }: { latest?: { title: string; href: string } }) {
  return (
    <footer className="site-footer">
      <div className="tb-grid">
        <div className="tb-cell">
          <span className="tb-label">Author</span>
          Frank Chiarulli Jr.
        </div>
        <div className="tb-cell">
          <span className="tb-label">Latest post</span>
          {latest ? <Link href={latest.href}>{latest.title}</Link> : "—"}
        </div>
        <div className="tb-cell">
          <span className="tb-label">Feed</span>
          <Link href="/blog/rss.xml">RSS</Link> / <Link href="/blog/atom.xml">Atom</Link>
        </div>
        <div className="tb-cell">
          <span className="tb-label">Source</span>
          <Link href="https://github.com/fcjr/frankchiarulli.com">GitHub</Link>
        </div>
        <div className="tb-cell tb-span">
          <RCScout />
          <RecurseRing />
        </div>
      </div>
    </footer>
  );
}

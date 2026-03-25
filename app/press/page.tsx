import Link from "../Link";
import { sans } from "../fonts";

export const metadata = {
  title: "Media - Frank Chiarulli Jr.",
  description: "Talks, press coverage, publications, and exhibitions by Frank Chiarulli Jr.",
};

type Entry = {
  title: string;
  venue: string;
  date: string;
  url?: string;
  type: "talk" | "podcast" | "article" | "paper" | "exhibition" | "mention";
  description?: string;
};

const entries: Entry[] = [
  {
    title: "RCade: Building a Community Arcade Cabinet",
    venue: "Localhost at the Recurse Center",
    date: "2026-03-18",
    url: "https://luma.com/localhost-rcade",
    type: "talk",
    description:
      "Presented at Localhost on reviving the hardware and building the deployment system for a custom arcade cabinet with a real CRT, custom graphics card, and 44+ community-made games.",
  },
  {
    title: "Building a 24-Bit Arcade CRT Display Adapter from Scratch",
    venue: "Adafruit Blog",
    date: "2026-02-06",
    url: "https://blog.adafruit.com/2026/02/06/building-a-24-bit-arcade-crt-display-adapter-from-scratch/",
    type: "article",
  },
  {
    title: "This USB to Analog VGA Display Adapter Is More Than GUD Enough for Arcade Gaming",
    venue: "Hackster.io",
    date: "2026-02-05",
    url: "https://www.hackster.io/news/this-usb-to-analog-vga-display-adapter-is-more-than-gud-enough-for-arcade-gaming-66a17fa88e74",
    type: "article",
  },
  {
    title: "Building a 24-bit Arcade CRT Display Adapter, From Scratch",
    venue: "scd31.com",
    date: "2026-02-04",
    url: "https://www.scd31.com/posts/building-an-arcade-display-adapter",
    type: "mention",
    description:
      "Stephen Downward's deep technical writeup of building a custom USB display adapter for the RCade arcade cabinet.",
  },
  {
    title: "Nibbles",
    venue: "joe.mou.fo",
    date: "2026-01-01",
    url: "https://joe.mou.fo/show/nibbles/",
    type: "mention",
    description:
      "A modern recreation of Nibbles.BAS with arcade spinner controls, inspired by the RCade cabinet.",
  },
  {
    title: "Let's Be Frank... A Ghostery Developer Says \"Hi!\"",
    venue: "GhoSTORIES with Franz & Pete",
    date: "2020-10-15",
    url: "https://open.spotify.com/episode/2WZIpaFZLLXSjHSf6cE8jt",
    type: "podcast",
    description:
      "Talked privacy engineering, anti-tracking technology, and what it's like building Ghostery's backend and desktop apps.",
  },
  {
    title: "A Baseline-Realistic Objective Open-Ended Kinematics Simulator for Evolutionary Robotics",
    venue: "GECCO '17 — ACM",
    date: "2017-07-15",
    url: "https://dl.acm.org/doi/10.1145/3067695.3082164",
    type: "paper",
    description:
      "Co-authored paper introducing BROOKS, an open-source physics simulator for evolutionary robotics that outperforms off-the-shelf alternatives and helps bridge the reality gap.",
  },
  {
    title: "Controlling 3D Printers with Artificial Neural Networks",
    venue: "Union College Senior Project",
    date: "2017-06-01",
    url: "https://cs.union.edu/Archives/SeniorProjects/2017/CS.2017/#5",
    type: "paper",
    description:
      "Senior thesis exploring whether artificial neural networks can supplant linear instruction for controlling 3D printers. Advised by Prof. John Rieffel.",
  },
  {
    title: "ArtBeat: What To See — Wikoff Student Gallery",
    venue: "Daily Gazette",
    date: "2017-01-01",
    url: "https://www.dailygazette.com/artbeat-what-to-see/article_b4e1786e-5013-560b-9f11-b415983a3950.html",
    type: "article",
    description:
      "Featured in the Daily Gazette's ArtBeat column for an exhibition of 3D modeling works at Union College's Wikoff Student Gallery.",
  },
  {
    title: "2017 Annual Student Photography Exhibition",
    venue: "The Photography Center of the Capital District, Troy, NY",
    date: "2017-03-01",
    type: "exhibition",
    description:
      "Selected to exhibit work alongside 10 Union College students. 56 photos were chosen from 110 entries submitted by 34 Capital Region students.",
  },
  {
    title: "4 Locals Graduate from Firefighter Training",
    venue: "Patch",
    date: "2011-12-16",
    url: "https://patch.com/new-york/chappaqua/4-locals-graduate-from-firefighter-training",
    type: "article",
    description:
      "Graduated from Westchester County's 87-hour firefighter training program and 9-hour survival course, joining the Chappaqua Fire Department.",
  },
];

const typeColors: Record<Entry["type"], string> = {
  talk: "var(--secondary)",
  podcast: "var(--tertiary)",
  article: "var(--headline)",
  paper: "var(--secondary)",
  exhibition: "var(--tertiary)",
  mention: "var(--text)",
};

const typeLabels: Record<Entry["type"], string> = {
  talk: "Talk",
  podcast: "Podcast",
  article: "Press",
  paper: "Paper",
  exhibition: "Exhibition",
  mention: "Mention",
};

// Group entries by year
function groupByYear(items: Entry[]): [string, Entry[]][] {
  const groups: Record<string, Entry[]> = {};
  for (const entry of items) {
    const year = entry.date.slice(0, 4);
    if (!groups[year]) groups[year] = [];
    groups[year].push(entry);
  }
  return Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a));
}

export default function PressPage() {
  const grouped = groupByYear(entries);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-paragraph hover:text-secondary text-sm font-medium transition-colors duration-200 group"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
          <span>home</span>
        </Link>
      </div>
      <header>
        <h1 className={`text-4xl font-bold text-headline mb-3 tracking-tight ${sans.className}`}>
          Media
        </h1>
        <p className="text-paragraph max-w-lg">
          Talks, publications, exhibitions, and press coverage.
        </p>
      </header>

      <hr className="glow-divider" />

      {/* Timeline */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div
          className="absolute left-[7px] top-2 bottom-2 w-px hidden sm:block"
          style={{ background: "linear-gradient(180deg, var(--secondary), var(--tertiary), transparent)" }}
        />

        <div className="flex flex-col gap-10">
          {grouped.map(([year, items]) => (
            <section key={year} className="relative">
              {/* Year marker */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="hidden sm:flex w-[15px] h-[15px] rounded-full items-center justify-center flex-shrink-0"
                  style={{
                    background: "var(--bg)",
                    border: "2px solid var(--secondary)",
                    boxShadow: "0 0 8px var(--glow)",
                  }}
                />
                <h2 className={`text-2xl font-bold text-headline tracking-tight ${sans.className}`}>
                  {year}
                </h2>
              </div>

              {/* Entries for this year */}
              <div className="flex flex-col gap-4 sm:pl-9">
                {items.map((entry, i) => (
                  <EntryCard key={i} entry={entry} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function EntryCard({ entry }: { entry: Entry }) {
  const color = typeColors[entry.type];

  const inner = (
    <article className="flex flex-col gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-current"
          style={{ color }}
        >
          {typeLabels[entry.type]}
        </span>
        <span className="text-xs text-paragraph uppercase tracking-wider">
          {entry.venue}
        </span>
        <span className="text-xs text-paragraph opacity-50">
          {new Date(entry.date.replace(/-/g, "/")).toLocaleDateString("en", {
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <h3 className="text-lg font-bold text-headline group-hover:text-secondary leading-tight transition-colors">
        {entry.title}
        {entry.url && (
          <span className="inline-block ml-2 text-xs opacity-40 group-hover:opacity-80 transition-opacity">
            ↗
          </span>
        )}
      </h3>
      {entry.description && (
        <p className="text-sm text-paragraph leading-relaxed">
          {entry.description}
        </p>
      )}
    </article>
  );

  if (entry.url) {
    return (
      <Link className="card block p-5 group" href={entry.url}>
        {inner}
      </Link>
    );
  }

  return <div className="card block p-5">{inner}</div>;
}

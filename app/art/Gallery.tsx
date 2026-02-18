"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Album, ArtPiece } from "./page";

type NavItem = {
  slug: string;
  title: string;
  children?: NavItem[];
};

const navigation: NavItem[] = [
  {
    slug: "2d-work",
    title: "2D Work",
    children: [
      { slug: "digital-art", title: "Digital Art" },
      {
        slug: "photography",
        title: "Photography",
        children: [
          { slug: "ghosts", title: "Ghosts" },
          { slug: "people", title: "People" },
          { slug: "machines", title: "Machines" },
          { slug: "schenectady", title: "Schenectady, NY" },
        ],
      },
      { slug: "printmaking", title: "Printmaking" },
    ],
  },
  {
    slug: "3d-work",
    title: "3D Work",
    children: [
      { slug: "query", title: "Query" },
      {
        slug: "traditional-sculpture",
        title: "Traditional Sculpture",
        children: [
          { slug: "mountain-climb", title: "Mountain Climb" },
          { slug: "diamonds-in-the-rust", title: "Diamonds in the Rust" },
          {
            slug: "get-your-head-outa-my-clouds",
            title: "Get Your Head Outa My Clouds",
          },
          { slug: "other", title: "Other" },
        ],
      },
      { slug: "3d-models", title: "3D Models" },
      { slug: "moving-sculpture", title: "Moving Sculpture" },
    ],
  },
  {
    slug: "evofab",
    title: "EvoFab",
    children: [{ slug: "evofab", title: "EvoFab" }],
  },
];

function collectSlugs(item: NavItem): string[] {
  const slugs = [item.slug];
  if (item.children) {
    for (const child of item.children) {
      slugs.push(...collectSlugs(child));
    }
  }
  return slugs;
}

function findNavItem(items: NavItem[], slug: string): NavItem | null {
  for (const item of items) {
    if (item.slug === slug) return item;
    if (item.children) {
      const found = findNavItem(item.children, slug);
      if (found) return found;
    }
  }
  return null;
}

function findParentPath(
  items: NavItem[],
  slug: string,
  path: NavItem[] = []
): NavItem[] | null {
  for (const item of items) {
    if (item.slug === slug) return [...path, item];
    if (item.children) {
      const found = findParentPath(item.children, slug, [...path, item]);
      if (found) return found;
    }
  }
  return null;
}

export default function Gallery({
  art,
  albums,
}: {
  art: ArtPiece[];
  albums: Album[];
}) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const activeAlbumSlugs = useMemo(() => {
    if (!activeFilter) return null;
    const item = findNavItem(navigation, activeFilter);
    if (!item) return null;
    return new Set(collectSlugs(item));
  }, [activeFilter]);

  const filteredArt = useMemo(() => {
    if (!activeAlbumSlugs) return art;
    return art.filter((piece) => activeAlbumSlugs.has(piece.album));
  }, [art, activeAlbumSlugs]);

  const activeAlbum = useMemo(() => {
    if (!activeFilter) return null;
    return albums.find((a) => a.slug === activeFilter) ?? null;
  }, [activeFilter, albums]);

  const breadcrumb = useMemo(() => {
    if (!activeFilter) return null;
    return findParentPath(navigation, activeFilter);
  }, [activeFilter]);

  // Reset selected when filter changes
  useEffect(() => {
    setSelected(null);
  }, [activeFilter]);

  // Lightbox controls
  const close = useCallback(() => setSelected(null), []);
  const prev = useCallback(() => {
    setSelected((i) =>
      i !== null ? (i - 1 + filteredArt.length) % filteredArt.length : null
    );
  }, [filteredArt.length]);
  const next = useCallback(() => {
    setSelected((i) => (i !== null ? (i + 1) % filteredArt.length : null));
  }, [filteredArt.length]);

  useEffect(() => {
    if (selected === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected, close, prev, next]);

  // Current nav level children (for filter buttons)
  const currentChildren = useMemo(() => {
    if (!activeFilter) return navigation;
    const item = findNavItem(navigation, activeFilter);
    if (item?.children) return item.children;
    if (breadcrumb && breadcrumb.length >= 2) {
      const parent = breadcrumb[breadcrumb.length - 2];
      return parent.children ?? [];
    }
    return [];
  }, [activeFilter, breadcrumb]);

  return (
    <>
      {/* Filter Navigation */}
      <nav className="flex flex-col gap-4 pb-4 border-b border-headline/10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-paragraph flex-wrap">
          {!activeFilter ? (
            <span className="text-headline font-semibold">All</span>
          ) : (
            <>
              <button
                onClick={() => setActiveFilter(null)}
                className="hover:text-secondary transition-colors cursor-pointer underline underline-offset-2"
              >
                All
              </button>
              {breadcrumb?.map((item, i) => (
                <span key={item.slug} className="flex items-center gap-1.5">
                  <span className="opacity-40">/</span>
                  {i < breadcrumb.length - 1 ? (
                    <button
                      onClick={() => setActiveFilter(item.slug)}
                      className="hover:text-secondary transition-colors cursor-pointer underline underline-offset-2"
                    >
                      {item.title}
                    </button>
                  ) : (
                    <span className="text-headline font-semibold">
                      {item.title}
                    </span>
                  )}
                </span>
              ))}
            </>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {activeFilter && (
            <button
              onClick={() => {
                if (breadcrumb && breadcrumb.length >= 2) {
                  setActiveFilter(breadcrumb[breadcrumb.length - 2].slug);
                } else {
                  setActiveFilter(null);
                }
              }}
              className="px-3 py-1.5 text-sm rounded-full border-2 border-headline/30 text-headline hover:border-secondary hover:text-secondary transition-colors cursor-pointer font-medium"
            >
              ← Back
            </button>
          )}
          {currentChildren.map((item) => {
            const isActive = item.slug === activeFilter;
            return (
              <button
                key={item.slug}
                onClick={() => setActiveFilter(item.slug)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors cursor-pointer ${
                  isActive
                    ? "bg-headline text-background font-semibold"
                    : "border-2 border-headline/30 text-headline hover:border-secondary hover:text-secondary font-medium"
                }`}
              >
                {item.title}
              </button>
            );
          })}
        </div>

        {/* Album description / artist statement */}
        {activeAlbum?.description && (
          <div className="text-sm text-paragraph italic space-y-2">
            {activeAlbum.description.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}
      </nav>

      {/* Image Grid */}
      <div className="columns-2 sm:columns-3 gap-3">
        {filteredArt.map((piece, i) =>
          piece.video ? (
            <button
              key={piece.src + i}
              className="mb-3 w-full block cursor-zoom-in break-inside-avoid group"
              onClick={() => setSelected(i)}
            >
              <video
                src={piece.video}
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-sm pointer-events-none group-hover:opacity-90 transition-opacity"
              />
            </button>
          ) : (
            <button
              key={piece.src + i}
              className="mb-3 w-full block cursor-zoom-in break-inside-avoid group"
              onClick={() => setSelected(i)}
            >
              <img
                src={piece.src}
                alt={piece.title}
                loading="lazy"
                className="w-full rounded-sm group-hover:opacity-90 transition-opacity"
              />
            </button>
          )
        )}
      </div>

      {filteredArt.length === 0 && (
        <p className="text-paragraph italic">No pieces in this album.</p>
      )}

      {/* Lightbox */}
      {selected !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={close}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none z-10 cursor-pointer"
            aria-label="Close"
          >
            &times;
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl leading-none z-10 cursor-pointer"
            aria-label="Previous"
          >
            &#8249;
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl leading-none z-10 cursor-pointer"
            aria-label="Next"
          >
            &#8250;
          </button>

          <div
            className="max-w-[90vw] max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {filteredArt[selected].video ? (
              <video
                src={filteredArt[selected].video}
                autoPlay
                loop
                muted
                playsInline
                controls
                className="max-w-full max-h-[85vh] object-contain rounded"
              />
            ) : (
              <img
                src={filteredArt[selected].src}
                alt={filteredArt[selected].title}
                className="max-w-full max-h-[85vh] object-contain rounded"
              />
            )}
            <p className="text-white/80 text-sm mt-3">
              {filteredArt[selected].title}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

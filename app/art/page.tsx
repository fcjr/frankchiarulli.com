import Link from "../Link";
import Gallery from "./Gallery";

export const metadata = {
  title: "Art - Frank Chiarulli Jr.",
  description:
    "Art gallery featuring digital art, photography, printmaking, sculpture, and installations by Frank Chiarulli Jr.",
};

export type ArtPiece = {
  src: string;
  title: string;
  video?: string;
  album: string;
};

export type Album = {
  slug: string;
  title: string;
  description?: string;
  parent: string;
};

const albums: Album[] = [
  // 2D Work
  {
    slug: "digital-art",
    title: "Digital Art",
    description: "3D Modeling & Mixed Media - 2015",
    parent: "2d-work",
  },
  {
    slug: "ghosts",
    title: "Ghosts",
    description: "B&W Gelatin Silver Print - 2017",
    parent: "photography",
  },
  {
    slug: "people",
    title: "People",
    description: "B&W Gelatin Silver Print - 2017",
    parent: "photography",
  },
  {
    slug: "machines",
    title: "Machines",
    description:
      "B&W Gelatin Silver Print - 2017. As shown in: The 2017 Annual Student Photography Exhibition at The Photography Center of the Capital District in Troy, NY & The 2017 Visual Arts Steinmetz Student Art Exhibition, Union College, Schenectady, NY",
    parent: "photography",
  },
  {
    slug: "schenectady",
    title: "Schenectady, NY",
    description: "B&W Gelatin Silver Print - 2017",
    parent: "photography",
  },
  {
    slug: "printmaking",
    title: "Printmaking",
    description:
      "Black Ink & 100% Cotton Paper / Four Colour Polymer Photogravure - 2017",
    parent: "2d-work",
  },

  // 3D Work
  {
    slug: "query",
    title: "Query",
    description:
      "Steel, Aluminum, LCD Screen, Custom Electronics, Acrylic - Spring, 2017\n\nModern technology affords unprecedented access to a constant flow of new information and media. This can be overwhelming at times and we must use our best judgement when choosing what to watch and read. No matter how hard we may try we can never keep up. This installation aims to bring attention to just how little we are able to consume.",
    parent: "3d-work",
  },
  {
    slug: "mountain-climb",
    title: "Mountain Climb",
    description: "Hammered Steel & Ply - 2017",
    parent: "traditional-sculpture",
  },
  {
    slug: "diamonds-in-the-rust",
    title: "Diamonds in the Rust",
    description: "Hammered & Polished Steel - 2017",
    parent: "traditional-sculpture",
  },
  {
    slug: "get-your-head-outa-my-clouds",
    title: "Get Your Head Outa My Clouds",
    description: "Steel, Cotton, Wood, Dirt - Spring, 2017",
    parent: "traditional-sculpture",
  },
  {
    slug: "other",
    title: "Other",
    description: "Unstable Hieroglyph: Balanced Plaster Pieces - 2016 / Organisms: Plaster - 2015",
    parent: "traditional-sculpture",
  },
  {
    slug: "3d-models",
    title: "3D Models",
    description: "3D Models, PLA - 2015",
    parent: "3d-work",
  },
  {
    slug: "moving-sculpture",
    title: "Moving Sculpture",
    description:
      "Tension: Wood, Elastic, Motors, Arduino - 2016 / An Avid Life Magazine Reader: Mixed Media, Moving Sculpture - 2016",
    parent: "3d-work",
  },

  // EvoFab
  { slug: "evofab", title: "EvoFab", parent: "evofab" },
];

const art: ArtPiece[] = [
  // ── Digital Art ──
  { src: "/art/goo-cell.jpg", title: "Goo Cell", album: "digital-art" },
  {
    src: "/art/goo-cell-video.mp4",
    title: "Goo Cell",
    video: "/art/goo-cell-video.mp4",
    album: "digital-art",
  },
  {
    src: "/art/future-scape-1.jpg",
    title: "Future Scape",
    album: "digital-art",
  },
  { src: "/art/geometrii-1.jpg", title: "Geometrii", album: "digital-art" },
  { src: "/art/cell-1.jpg", title: "Cell", album: "digital-art" },
  { src: "/art/cell-2.jpg", title: "Cell 2", album: "digital-art" },
  { src: "/art/cell-3.jpg", title: "Cell 3", album: "digital-art" },
  { src: "/art/future-scape-2.jpg", title: "Future 2", album: "digital-art" },
  { src: "/art/abstract-1.jpg", title: "Abstract", album: "digital-art" },
  {
    src: "/art/abstract-2.jpg",
    title: "Abstract Alt",
    album: "digital-art",
  },
  {
    src: "/art/geometrii-2.jpg",
    title: "Geometrii 2",
    album: "digital-art",
  },

  // ── Ghosts ── B&W Gelatin Silver Print - 2017
  { src: "/art/ghosts-1.jpg", title: "Ghosts", album: "ghosts" },
  { src: "/art/ghosts-2.jpg", title: "Ghosts", album: "ghosts" },
  { src: "/art/ghosts-3.jpg", title: "Ghosts", album: "ghosts" },

  // ── People ── B&W Gelatin Silver Print - 2017
  { src: "/art/daria-side-a.jpg", title: "Daria, Side A", album: "people" },
  { src: "/art/daria-side-b.jpg", title: "Daria, Side B", album: "people" },
  { src: "/art/man-in-street.jpg", title: "Man in Street", album: "people" },
  { src: "/art/flowers.jpg", title: "Flowers?", album: "people" },

  // ── Machines ── B&W Gelatin Silver Print - 2017
  {
    src: "/art/machines-ill-leave-behind-1.jpg",
    title: "Machines I'll Leave Behind",
    album: "machines",
  },
  {
    src: "/art/reciprocating-arm.jpg",
    title: "Reciprocating Arm",
    album: "machines",
  },
  { src: "/art/machines-press.jpg", title: "Press", album: "machines" },
  {
    src: "/art/machines-ill-leave-behind-2.jpg",
    title: "Machines I'll Leave Behind",
    album: "machines",
  },
  {
    src: "/art/machines-ill-leave-behind-3.jpg",
    title: "Machines I'll Leave Behind",
    album: "machines",
  },
  {
    src: "/art/machines-ill-leave-behind-4.jpg",
    title: "Machines I'll Leave Behind",
    album: "machines",
  },

  // ── Schenectady, NY ──
  {
    src: "/art/schenectady-1.jpg",
    title: "Schenectady, NY",
    album: "schenectady",
  },
  {
    src: "/art/schenectady-2.jpg",
    title: "Schenectady, NY",
    album: "schenectady",
  },
  {
    src: "/art/schenectady-3.jpg",
    title: "Schenectady, NY",
    album: "schenectady",
  },
  {
    src: "/art/schenectady-4.jpg",
    title: "Schenectady, NY",
    album: "schenectady",
  },
  {
    src: "/art/schenectady-5.jpg",
    title: "Schenectady, NY",
    album: "schenectady",
  },

  // ── Printmaking ──
  {
    src: "/art/like-clockwork.jpg",
    title: "Like Clockwork",
    album: "printmaking",
  },
  {
    src: "/art/goo-cell-revisited-gallery.jpg",
    title: "Goo Cell Revisited",
    album: "printmaking",
  },
  {
    src: "/art/goo-cell-revisited-1.jpg",
    title: "Goo Cell Revisited",
    album: "printmaking",
  },
  {
    src: "/art/goo-cell-revisited-2.jpg",
    title: "Goo Cell Revisited",
    album: "printmaking",
  },
  {
    src: "/art/goo-cell-revisited-making-of-1.jpg",
    title: "Goo Cell Revisited, The Making of",
    album: "printmaking",
  },
  {
    src: "/art/goo-cell-revisited-making-of-2.jpg",
    title: "Goo Cell Revisited, The Making of",
    album: "printmaking",
  },
  { src: "/art/printmaking-press.jpg", title: "Press", album: "printmaking" },
  {
    src: "/art/press-life.jpg",
    title: "Press Life",
    album: "printmaking",
  },
  {
    src: "/art/circuit-city-gallery.jpg",
    title: "Circuit City",
    album: "printmaking",
  },
  {
    src: "/art/circuit-city.jpg",
    title: "Circuit City",
    album: "printmaking",
  },

  // ── Query ── Steel, Aluminum, LCD Screen, Custom Electronics, Acrylic - Spring, 2017
  { src: "/art/query-01.jpg", title: "Query", album: "query" },
  {
    src: "/art/query-video.mp4",
    title: "Query Video",
    video: "/art/query-video.mp4",
    album: "query",
  },
  { src: "/art/query-02.jpg", title: "Query", album: "query" },
  { src: "/art/query-03.jpg", title: "Query", album: "query" },
  { src: "/art/query-04.jpg", title: "Query", album: "query" },
  { src: "/art/query-05.jpg", title: "Query", album: "query" },
  { src: "/art/query-06.jpg", title: "Query", album: "query" },
  { src: "/art/query-07.jpg", title: "Query", album: "query" },
  { src: "/art/query-08.jpg", title: "Query", album: "query" },
  { src: "/art/query-09.jpg", title: "Query", album: "query" },
  { src: "/art/query-10.jpg", title: "Query", album: "query" },
  { src: "/art/query-11.jpg", title: "Query", album: "query" },
  { src: "/art/query-12.jpg", title: "Query", album: "query" },
  { src: "/art/query-13.jpg", title: "Query", album: "query" },
  { src: "/art/query-14.jpg", title: "Query", album: "query" },
  { src: "/art/query-15.jpg", title: "Query", album: "query" },
  { src: "/art/query-16.jpg", title: "Query", album: "query" },
  { src: "/art/query-17.jpg", title: "Query", album: "query" },
  { src: "/art/query-18.jpg", title: "Query", album: "query" },

  // ── Mountain Climb ── Hammered Steel & Ply - 2017
  {
    src: "/art/mountain-climb-1.jpg",
    title: "Mountain Climb",
    album: "mountain-climb",
  },
  {
    src: "/art/mountain-climb-2.jpg",
    title: "Mountain Climb",
    album: "mountain-climb",
  },
  {
    src: "/art/mountain-climb-3.jpg",
    title: "Mountain Climb",
    album: "mountain-climb",
  },
  {
    src: "/art/mountain-climb-4.jpg",
    title: "Mountain Climb",
    album: "mountain-climb",
  },

  // ── Diamonds in the Rust ── Hammered & Polished Steel - 2017
  {
    src: "/art/diamonds-in-the-rust-1.jpg",
    title: "Diamonds in the Rust",
    album: "diamonds-in-the-rust",
  },
  {
    src: "/art/diamonds-in-the-rust-2.jpg",
    title: "Diamonds in the Rust",
    album: "diamonds-in-the-rust",
  },
  {
    src: "/art/diamonds-in-the-rust-3.jpg",
    title: "Diamonds in the Rust",
    album: "diamonds-in-the-rust",
  },
  {
    src: "/art/diamonds-in-the-rust-4.jpg",
    title: "Diamonds in the Rust",
    album: "diamonds-in-the-rust",
  },
  {
    src: "/art/diamonds-in-the-rust-5.jpg",
    title: "Diamonds in the Rust",
    album: "diamonds-in-the-rust",
  },

  // ── Get Your Head Outa My Clouds ── Steel, Cotton, Wood, Dirt - Spring, 2017
  {
    src: "/art/head-outa-my-clouds-1.jpg",
    title: "Get Your Head Outa My Clouds",
    album: "get-your-head-outa-my-clouds",
  },
  {
    src: "/art/head-outa-my-clouds-2.jpg",
    title: "Get Your Head Outa My Clouds",
    album: "get-your-head-outa-my-clouds",
  },
  {
    src: "/art/head-outa-my-clouds-3.jpg",
    title: "Get Your Head Outa My Clouds",
    album: "get-your-head-outa-my-clouds",
  },

  // ── Other ──
  {
    src: "/art/unstable-hieroglyph.jpg",
    title: "Unstable Hieroglyph",
    album: "other",
  },
  { src: "/art/organisms-1.jpg", title: "Organisms", album: "other" },
  { src: "/art/organisms-2.jpg", title: "Organisms", album: "other" },
  { src: "/art/organisms-3.jpg", title: "Organisms", album: "other" },

  // ── 3D Models ──
  { src: "/art/mutation-1.jpg", title: "Mutation", album: "3d-models" },
  { src: "/art/mutation-2.jpg", title: "Mutation", album: "3d-models" },
  { src: "/art/mutation-3.jpg", title: "Mutation", album: "3d-models" },
  { src: "/art/mutation-4.jpg", title: "Mutation", album: "3d-models" },
  { src: "/art/mutation-5.jpg", title: "Mutation", album: "3d-models" },
  { src: "/art/mutation-6.jpg", title: "Mutation", album: "3d-models" },
  { src: "/art/mutation-7.jpg", title: "Mutation", album: "3d-models" },

  // ── Moving Sculpture ──
  {
    src: "/art/tension-video-1.mp4",
    title: "Tension",
    video: "/art/tension-video-1.mp4",
    album: "moving-sculpture",
  },
  {
    src: "/art/tension.gif",
    title: "Tension",
    album: "moving-sculpture",
  },
  {
    src: "/art/tension-video-2.mp4",
    title: "Tension",
    video: "/art/tension-video-2.mp4",
    album: "moving-sculpture",
  },
  {
    src: "/art/avid-life-reader.mp4",
    title: "An Avid Life Magazine Reader",
    video: "/art/avid-life-reader.mp4",
    album: "moving-sculpture",
  },
  {
    src: "/art/tension-video-3.mp4",
    title: "Tension",
    video: "/art/tension-video-3.mp4",
    album: "moving-sculpture",
  },

  // ── EvoFab ──
  { src: "/art/evofab-1.jpg", title: "EvoFab", album: "evofab" },
  { src: "/art/evofab-2.jpg", title: "EvoFab", album: "evofab" },
  { src: "/art/evofab-3.jpg", title: "EvoFab", album: "evofab" },
];

export default function ArtPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-paragraph hover:text-secondary text-sm font-medium transition-colors duration-200 group"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>
          <span>home</span>
        </Link>
      </div>
      <header>
        <h1 className="text-4xl font-bold text-headline mb-3 tracking-tight">Art</h1>
        <p className="text-paragraph">
          Sculpture, photography, printmaking, and interactive installations from a previous life.
        </p>
      </header>

      <hr className="glow-divider" />

      <Gallery art={art} albums={albums} />
    </div>
  );
}

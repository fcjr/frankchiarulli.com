export type Project = {
  name: string;
  tagline: string;
  url: string;
};

// Products I'm actively building
export const products: Project[] = [
  {
    name: "Clearly",
    tagline: "Endpoint security for engineers who use AI",
    url: "https://browseclearly.com",
  },
  {
    name: "Left Shift",
    tagline: "Cloud security for identity & infrastructure",
    url: "https://leftshift.com",
  },
  {
    name: "Moonfoot Labs",
    tagline: "Ideas into products, products into companies",
    url: "https://moonfoot.co",
  },
  {
    name: "Verdancy",
    tagline: "Feedback platform for apps built with AI",
    url: "https://verdancy.ai",
  },
  {
    name: "Verifiable",
    tagline: "Proof you're a real human",
    url: "https://verifiable.at",
  },
];

// Independent consulting engagements
export const consulting: Project[] = [
  {
    name: "Share-a-Cart",
    tagline: "Created & enabled AI for the cart platform",
    url: "https://share-a-cart.com/developers",
  },
];

// Notable builds & open source
export const builds: Project[] = [
  {
    name: "RCade",
    tagline: "Community arcade cabinet on a real CRT",
    url: "/blog/building-the-rcade/",
  },
  {
    name: "etch-a-db",
    tagline: "A database stored on an Etch-a-Sketch",
    url: "https://www.etchadb.com/",
  },
  {
    name: "ShiftAPI",
    tagline: "Full-stack type safety, generated from Go",
    url: "https://shiftapi.dev/",
  },
  {
    name: "SMLL",
    tagline: "Near optimal* compression using LLMs",
    url: "/blog/smll/",
  },
  {
    name: "aia-transport-go",
    tagline: "AIA certificate-chain resolution for Go",
    url: "https://github.com/fcjr/aia-transport-go",
  },
  {
    name: "geticon",
    tagline: "Grab any app's icon, cross-platform",
    url: "https://github.com/fcjr/geticon",
  },
  {
    name: "subtool",
    tagline: "Local AI subtitle generation & translation",
    url: "https://github.com/fcjr/subtool",
  },
];

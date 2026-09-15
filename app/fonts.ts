import localFont from "next/font/local";

export const sans = localFont({
  src: "./fonts/CommitMono-400-Regular.woff2",
  display: "swap",
  weight: "400",
  style: "normal",
});

export const display = localFont({
  src: "./fonts/Isonorm 3098 Regular.otf",
  display: "swap",
  weight: "400",
  style: "normal",
  variable: "--font-display",
});

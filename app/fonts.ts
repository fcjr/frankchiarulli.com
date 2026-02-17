import localFont from "next/font/local";
import { Merriweather } from "next/font/google";

export const sans = localFont({
  src: "./fonts/CommitMono-400-Regular.woff2",
  display: "swap",
  weight: "400",
  style: "normal",
});

export const serif = Merriweather({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

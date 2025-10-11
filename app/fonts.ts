import localFont from "next/font/local";
import { Merriweather } from "next/font/google";

export const sans = localFont({
  src: "./fonts/Isonorm 3098 Regular.otf",
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

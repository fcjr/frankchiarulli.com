"use client";

import { sans } from "./fonts";
import { usePathname } from "next/navigation";
import Link from "./Link";

export default function HomeLink() {
  const pathname = usePathname();
  const isActive = pathname === "/";
  return (
    <Link
      href="/"
      className={[
        sans.className,
        "inline-block text-3xl font-bold text-gray-900 hover:text-gray-700 transition-colors",
      ].join(" ")}
    >
      Frank Chiarulli Jr.
    </Link>
  );
}

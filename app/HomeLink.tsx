"use client";

import { usePathname } from "next/navigation";
import Link from "./Link";

export default function HomeLink() {
  const pathname = usePathname();
  const isActive = pathname === "/";

  if (isActive) {
    return null; // Hero on homepage handles the name
  }

  return (
    <Link href="/" className="hero-title inline-block">
      fcjr
    </Link>
  );
}

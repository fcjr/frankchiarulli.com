"use client";

import { useEffect, useState } from "react";
import { sans } from "./fonts";

export default function ScrollCue() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`scroll-cue ${sans.className} ${hidden ? "scroll-cue-hidden" : ""}`}
      aria-hidden="true"
    >
      <span>more</span>
      <span className="scroll-cue-arrow">▾</span>
    </div>
  );
}

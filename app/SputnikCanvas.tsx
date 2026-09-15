"use client";

import dynamic from "next/dynamic";

const Sputnik = dynamic(() => import("./Sputnik"), { ssr: false });

export default function SputnikCanvas() {
  return (
    <div className="sputnik" aria-hidden="true">
      <Sputnik />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

const DURATION = 3200;
const STRENGTH = 4.5;

export default function HeroTitle() {
  const [boiling, setBoiling] = useState(false);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // a click sets the wobble strong, then it dies down over a few seconds
  const shake = () => {
    const map = document.getElementById("boil-name-map");
    if (!map) return;
    cancelAnimationFrame(frame.current);
    setBoiling(true);
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / DURATION);
      const strength = STRENGTH * (1 - k) * (1 - k);
      map.setAttribute("scale", strength.toFixed(2));
      if (k < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        setBoiling(false);
      }
    };
    frame.current = requestAnimationFrame(tick);
  };

  return (
    <h1 className={`hero-title mb-1${boiling ? " boiling" : ""}`} onClick={shake}>
      <span className="glitch-wrap">Frank</span>
      <br />
      <span className="glitch-wrap">Chiarulli Jr</span>
      <span className="text-secondary">.</span>
    </h1>
  );
}

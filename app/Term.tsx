"use client";

import { useRef, useState, useCallback, type ReactNode } from "react";

export function Term({ tip, children }: { tip: string; children: ReactNode }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);
  const [below, setBelow] = useState(false);

  const positionTip = useCallback(() => {
    const wrap = wrapRef.current;
    const tipEl = tipRef.current;
    if (!wrap || !tipEl) return;

    const pad = 12;
    const wrapRect = wrap.getBoundingClientRect();
    const tipWidth = tipEl.offsetWidth;
    const tipHeight = tipEl.offsetHeight;

    const centeredLeft = wrapRect.left + wrapRect.width / 2 - tipWidth / 2;
    const centeredRight = centeredLeft + tipWidth;

    let dx = 0;
    if (centeredLeft < pad) {
      dx = pad - centeredLeft;
    } else if (centeredRight > window.innerWidth - pad) {
      dx = window.innerWidth - pad - centeredRight;
    }

    setShift(Math.round(dx));
    setBelow(wrapRect.top < tipHeight + 16);
  }, []);

  return (
    <span
      ref={wrapRef}
      className={`glossary-term${below ? " glossary-below" : ""}`}
      tabIndex={0}
      onMouseEnter={positionTip}
      onFocus={positionTip}
      style={{ "--tip-shift": `${shift}px` } as React.CSSProperties}
    >
      <span className="glossary-label">{children}</span>
      <span ref={tipRef} className="glossary-tip" role="tooltip">
        {tip}
      </span>
    </span>
  );
}

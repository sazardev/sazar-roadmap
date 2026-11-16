"use client";

import { type ReactNode, useEffect, useRef } from "react";

export function CoachScroll({ children, dependency }: { children: ReactNode; dependency: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The dependency is the trigger, not a value read by the effect.
    void dependency;
    const node = ref.current;
    if (!node) return;
    const frame = window.requestAnimationFrame(() => {
      node.scrollTop = node.scrollHeight;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [dependency]);

  return (
    <div ref={ref} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      {children}
    </div>
  );
}

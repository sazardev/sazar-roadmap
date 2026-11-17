"use client";

import { useEffect, useRef } from "react";

/** Close a popover-style <details> on Escape or a click outside it. */
export function useDismissableDetails() {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const onPointerDown = (event: PointerEvent) => {
      if (node.open && !node.contains(event.target as Node)) node.open = false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && node.open) node.open = false;
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return ref;
}

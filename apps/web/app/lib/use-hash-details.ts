"use client";

import { useEffect } from "react";

/**
 * Anchors like "New note" point at a <details> element. Browsers scroll to it but do not open it,
 * so open the target explicitly when the hash changes.
 */
export function useOpenHashDetails(): void {
  useEffect(() => {
    const openTarget = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      const node = document.getElementById(id);
      if (node instanceof HTMLDetailsElement) node.open = true;
    };
    openTarget();
    window.addEventListener("hashchange", openTarget);
    return () => window.removeEventListener("hashchange", openTarget);
  }, []);
}

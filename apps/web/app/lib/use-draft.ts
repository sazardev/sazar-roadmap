"use client";

import { useCallback, useEffect, useState } from "react";

export function useDraft(key: string, initialValue: string) {
  const [value, setValue] = useState(initialValue);
  const [restored, setRestored] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) {
        setValue(stored);
        setRestored(true);
      }
    } catch {
      // Storage can be unavailable in private modes; the form still works without drafts.
    }
  }, [key]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        if (value.trim()) {
          window.localStorage.setItem(key, value);
          setSavedAt(Date.now());
        } else {
          window.localStorage.removeItem(key);
          setSavedAt(null);
        }
      } catch {
        // Ignore quota and privacy-mode errors.
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [key, value]);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage errors.
    }
    setValue("");
    setRestored(false);
    setSavedAt(null);
  }, [key]);

  return { value, setValue, clear, restored, savedAt };
}

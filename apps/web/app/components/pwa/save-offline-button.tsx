"use client";

import { Check, Download, Loader2, WifiOff } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import type { CacheSaveResult } from "~/lib/pwa";
import { sendPwaMessage } from "~/lib/pwa";
import { useOnlineStatus } from "./use-pwa";

type SaveState = "idle" | "saving" | "saved" | "error";

export function SaveOfflineButton({
  urls,
  label = "Save for offline",
  className,
}: {
  urls: string[];
  label?: string;
  className?: string;
}) {
  const online = useOnlineStatus();
  const [state, setState] = useState<SaveState>("idle");
  const [saved, setSaved] = useState(0);

  const save = async () => {
    if (!online) {
      setState("error");
      return;
    }
    setState("saving");
    const result = await sendPwaMessage<CacheSaveResult>({ type: "CACHE_URLS", urls }, 120000);
    if (result?.saved) {
      setSaved(result.saved);
      setState("saved");
    } else {
      setState("error");
    }
  };

  const message =
    state === "saving"
      ? "Saving…"
      : state === "saved"
        ? `Saved ${saved} page${saved === 1 ? "" : "s"}`
        : state === "error"
          ? online
            ? "Offline cache unavailable"
            : "Connect to save"
          : label;

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className={className}
      onClick={save}
      disabled={state === "saving"}
      aria-live="polite"
      icon={
        state === "saving" ? (
          <Loader2 size={14} className="animate-spin" />
        ) : state === "saved" ? (
          <Check size={14} />
        ) : state === "error" ? (
          <WifiOff size={14} />
        ) : (
          <Download size={14} />
        )
      }
    >
      {message}
    </Button>
  );
}

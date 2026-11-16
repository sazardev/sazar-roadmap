"use client";

import { RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { type BeforeInstallPromptEvent, registerServiceWorker, setInstallPrompt } from "~/lib/pwa";
import { useOnlineStatus } from "./use-pwa";

export function PwaRuntime() {
  const online = useOnlineStatus();
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    let cancelled = false;

    registerServiceWorker()
      .then((next) => {
        if (cancelled || !next) return;
        setRegistration(next);
        if (next.waiting) setUpdateReady(true);
        next.addEventListener("updatefound", () => {
          const worker = next.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateReady(true);
            }
          });
        });
      })
      .catch(() => {
        // The app works without a service worker; offline support is an enhancement.
      });

    return () => {
      cancelled = true;
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const applyUpdate = async () => {
    const next = registration ?? (await navigator.serviceWorker.ready);
    next.waiting?.postMessage({ type: "SKIP_WAITING" });
    window.setTimeout(() => window.location.reload(), 350);
  };

  return (
    <>
      {!online ? (
        <div
          role="status"
          className="border-b border-warning/25 bg-warning-soft px-4 py-2.5 text-xs text-warning sm:px-6"
        >
          <div className="mx-auto flex max-w-[1440px] items-center gap-2">
            <WifiOff size={14} className="shrink-0" />
            <p className="min-w-0 flex-1">
              Offline. Saved pages are still available; changes need a connection.
            </p>
            <a href="/offline" className="shrink-0 underline underline-offset-4">
              Saved pages
            </a>
          </div>
        </div>
      ) : null}

      {updateReady ? (
        <div
          role="status"
          className="border-b border-accent/20 bg-accent-soft px-4 py-2 text-xs text-accent sm:px-6"
        >
          <div className="mx-auto flex max-w-[1440px] items-center gap-2">
            <RefreshCw size={14} className="shrink-0" />
            <p className="min-w-0 flex-1">A new version is ready.</p>
            <button
              type="button"
              onClick={applyUpdate}
              className="shrink-0 font-semibold underline underline-offset-4"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => setUpdateReady(false)}
              className="shrink-0 underline underline-offset-4"
            >
              Later
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

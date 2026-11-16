"use client";

import { Download, RefreshCw, WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type BeforeInstallPromptEvent,
  isIos,
  isStandalone,
  promptInstall,
  registerServiceWorker,
  setInstallPrompt,
} from "~/lib/pwa";
import { useInstallPrompt, useOnlineStatus } from "./use-pwa";

const DISMISS_KEY = "sd_install_dismissed_at";
const DISMISS_MS = 14 * 24 * 60 * 60 * 1000;

export function PwaRuntime() {
  const online = useOnlineStatus();
  const installEvent = useInstallPrompt();
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(true);
  const [installBusy, setInstallBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) {
      setInstallDismissed(true);
      return;
    }
    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) ?? 0);
    setInstallDismissed(Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_MS);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstallPrompt(null);
      setInstallDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    let cancelled = false;
    let registrationRef: ServiceWorkerRegistration | null = null;

    registerServiceWorker()
      .then((next) => {
        if (cancelled || !next) return;
        registrationRef = next;
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
      if (registrationRef) {
        // Browsers do not expose a removeEventListener for the updatefound worker, but the
        // registration object is short-lived and the component only unmounts with the shell.
      }
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    setInstallBusy(true);
    try {
      const outcome = await promptInstall();
      if (outcome !== "unavailable") {
        setInstallDismissed(true);
        window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
      }
    } finally {
      setInstallBusy(false);
    }
  };

  const dismissInstall = () => {
    setInstallDismissed(true);
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  const applyUpdate = async () => {
    const next = registration ?? (await navigator.serviceWorker.ready);
    next.waiting?.postMessage({ type: "SKIP_WAITING" });
    window.setTimeout(() => window.location.reload(), 350);
  };

  const showInstall = Boolean(installEvent) && !installDismissed && !updateReady && !isIos();

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
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-50 flex w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-lg border border-line bg-raised p-4 shadow-float md:bottom-6 md:left-auto md:right-6 md:w-96 md:translate-x-0"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <RefreshCw size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">A new version is ready</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              Reload to use the latest content and offline cache.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={applyUpdate}
                className="inline-flex min-h-9 items-center rounded-md bg-ink px-3 text-xs font-medium text-canvas"
              >
                Reload
              </button>
              <button
                type="button"
                onClick={() => setUpdateReady(false)}
                className="inline-flex min-h-9 items-center rounded-md px-2 text-xs text-muted hover:text-ink"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showInstall ? (
        <div
          role="dialog"
          aria-label="Install Sazar Roadmap"
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-50 flex w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-lg border border-line bg-raised p-4 shadow-float md:bottom-6 md:left-auto md:right-6 md:w-96 md:translate-x-0"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
            <Download size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Install Roadmap</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              Full screen, faster launches and your saved pages available offline.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={install}
                disabled={installBusy}
                className="inline-flex min-h-9 items-center rounded-md bg-accent px-3 text-xs font-medium text-accent-ink disabled:opacity-60"
              >
                {installBusy ? "Installing…" : "Install"}
              </button>
              <button
                type="button"
                onClick={dismissInstall}
                className="inline-flex min-h-9 items-center rounded-md px-2 text-xs text-muted hover:text-ink"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismissInstall}
            aria-label="Dismiss install prompt"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-hover hover:text-ink"
          >
            <X size={15} />
          </button>
        </div>
      ) : null}
    </>
  );
}

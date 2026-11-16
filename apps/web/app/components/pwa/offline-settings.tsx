"use client";

import { Download, HardDrive, RefreshCw, Trash2, Wifi } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardBody, CardHeader } from "~/components/ui/surfaces";
import { type CacheStatus, isIos, isStandalone, promptInstall, sendPwaMessage } from "~/lib/pwa";
import { useInstallPrompt, useOnlineStatus } from "./use-pwa";

function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const amount = value / 1024 ** exponent;
  return `${amount >= 10 || exponent === 0 ? Math.round(amount) : amount.toFixed(1)} ${units[exponent]}`;
}

export function OfflineSettings() {
  const online = useOnlineStatus();
  const installEvent = useInstallPrompt();
  const [status, setStatus] = useState<CacheStatus | null>(null);
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [environment, setEnvironment] = useState({ standalone: false, ios: false });

  useEffect(() => {
    setEnvironment({ standalone: isStandalone(), ios: isIos() });
  }, []);

  const refresh = useCallback(async () => {
    const next = await sendPwaMessage<CacheStatus>({ type: "GET_CACHE_STATUS" }, 5000);
    setStatus(next);
    if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate();
      setStorage({ usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const clear = async () => {
    setBusy(true);
    setMessage(null);
    const result = await sendPwaMessage<{ ok: true }>({ type: "CLEAR_PAGES" }, 15000);
    setBusy(false);
    setConfirming(false);
    setMessage(
      result?.ok ? "Saved pages cleared." : "Offline storage is not available in this build.",
    );
    await refresh();
  };

  const install = async () => {
    setBusy(true);
    const outcome = await promptInstall();
    setBusy(false);
    if (outcome === "accepted") setMessage("Installed. Open it from your home screen.");
    if (outcome === "dismissed") setMessage("Install dismissed.");
    if (outcome === "unavailable") setMessage("Use your browser's install action to add the app.");
  };

  const { standalone, ios } = environment;

  return (
    <Card id="offline">
      <CardHeader
        title="Offline and install"
        description="Keep visited topics on this device, install the app and control the offline cache."
        action={
          <Badge tone={online ? "success" : "warning"}>
            {online ? (
              <>
                <Wifi size={11} /> Online
              </>
            ) : (
              "Offline"
            )}
          </Badge>
        }
      />
      <CardBody className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-line bg-surface/60 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Saved pages
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{status ? status.pages : "—"}</p>
          </div>
          <div className="rounded-lg border border-line bg-surface/60 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Device storage
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {storage ? formatBytes(storage.usage) : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-surface/60 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Cache version
            </p>
            <p className="mt-1 truncate font-mono text-sm font-semibold">
              {status?.version ?? "not active"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!standalone ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={install}
              disabled={busy || !installEvent}
              icon={<Download size={14} />}
            >
              {installEvent ? "Install app" : ios ? "Add to Home Screen" : "Install from browser"}
            </Button>
          ) : (
            <Badge tone="success">Installed app</Badge>
          )}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void refresh()}
            disabled={busy}
            icon={<RefreshCw size={14} />}
          >
            Refresh
          </Button>
          {confirming ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={clear}
                disabled={busy}
                icon={<Trash2 size={14} />}
              >
                Confirm clear
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
                disabled={busy}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(true)}
              disabled={busy || !status}
              icon={<Trash2 size={14} />}
            >
              Clear saved pages
            </Button>
          )}
        </div>

        {ios && !standalone ? (
          <p className="rounded-md border border-line bg-surface/60 px-3 py-2 text-xs leading-relaxed text-muted">
            On iPhone and iPad, open the Share menu in Safari and choose{" "}
            <span className="font-medium text-ink">Add to Home Screen</span>.
          </p>
        ) : null}

        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
          <HardDrive size={14} className="mt-0.5 shrink-0" />
          Visited topics are cached automatically. Use “Save for offline” on a roadmap to keep the
          whole path. Only saved page content is stored; practice, notes and reviews need a
          connection.
        </p>

        {message ? (
          <p aria-live="polite" className="text-xs text-muted">
            {message}
          </p>
        ) : null}
      </CardBody>
    </Card>
  );
}

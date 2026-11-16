export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export interface CacheStatus {
  ok: true;
  pages: number;
  images: number;
  static: number;
  version: string;
}

export interface CacheSaveResult {
  ok: true;
  saved: number;
}

type PwaMessage =
  | { type: "SKIP_WAITING" }
  | { type: "CACHE_URLS"; urls: string[] }
  | { type: "GET_CACHE_STATUS" }
  | { type: "CLEAR_PAGES" }
  | { type: "CLEAR_ALL" };

let installPrompt: BeforeInstallPromptEvent | null = null;
const installListeners = new Set<() => void>();

function emitInstall(): void {
  for (const listener of installListeners) listener();
}

export function setInstallPrompt(event: BeforeInstallPromptEvent | null): void {
  installPrompt = event;
  emitInstall();
}

export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return installPrompt;
}

export function subscribeInstallPrompt(listener: () => void): () => void {
  installListeners.add(listener);
  return () => {
    installListeners.delete(listener);
  };
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined") return null;
  if (!import.meta.env.PROD) return null;
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return null;
  }
}

export async function sendPwaMessage<T extends CacheStatus | CacheSaveResult | { ok: true }>(
  message: PwaMessage,
  timeoutMs = 30000,
): Promise<T | null> {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;

  let worker: ServiceWorker | null = null;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length === 0) return null;
    const registration = await navigator.serviceWorker.ready;
    worker = registration.active;
  } catch {
    return null;
  }
  if (!worker) return null;

  return new Promise<T | null>((resolve) => {
    const channel = new MessageChannel();
    let settled = false;
    const finish = (value: T | null) => {
      if (settled) return;
      settled = true;
      channel.port1.close();
      resolve(value);
    };
    channel.port1.onmessage = (event: MessageEvent<unknown>) => finish(event.data as T);
    worker.postMessage(message, [channel.port2]);
    setTimeout(() => finish(null), timeoutMs);
  });
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const event = installPrompt;
  if (!event) return "unavailable";
  await event.prompt();
  const choice = await event.userChoice;
  setInstallPrompt(null);
  return choice.outcome;
}

export async function clearOfflinePages(): Promise<boolean> {
  const result = await sendPwaMessage<{ ok: true }>({ type: "CLEAR_PAGES" }, 5000);
  return result?.ok === true;
}

export function clearLocalDrafts(): void {
  if (typeof window === "undefined") return;
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith("sd:practice:") || key.startsWith("sd:note:")) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // Private modes can reject storage access; sign-out still proceeds.
  }
}

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export function formatHours(hours: number): string {
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

export function percent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

export function isoDate(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function startOfWeek(date = new Date(), weekStartsOn = 1): Date {
  const copy = new Date(date);
  const day = copy.getUTCDay();
  const diff = (day - weekStartsOn + 7) % 7;
  copy.setUTCDate(copy.getUTCDate() - diff);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

export function daysBetween(fromIso: string, to = new Date()): number {
  const from = new Date(fromIso);
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}

export function relativeDay(iso: string, now = new Date()): string {
  const days = daysBetween(iso, now);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function parseStringList(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function safeRedirect(value: string | null, fallback = "/"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

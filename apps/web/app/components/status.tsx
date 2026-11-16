import { Award, Check, Circle, Clock3, type LucideIcon, Play } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import type { TopicStatus } from "~/features/progress/progress.server";
import { cn } from "~/lib/utils";

const meta: Record<
  TopicStatus,
  { label: string; icon: LucideIcon; tone: "neutral" | "warning" | "success" | "solid" }
> = {
  not_started: { label: "Not started", icon: Circle, tone: "neutral" },
  learning: { label: "In practice", icon: Clock3, tone: "warning" },
  practiced: { label: "Practice passed", icon: Check, tone: "success" },
  mastered: { label: "Mastered", icon: Award, tone: "solid" },
};

export function TopicStatusBadge({ status }: { status: TopicStatus }) {
  const item = meta[status];
  const Icon = item.icon;
  return (
    <Badge tone={item.tone}>
      <Icon size={11} strokeWidth={2} />
      {item.label}
    </Badge>
  );
}

export function TopicStatusIcon({
  status,
  className,
}: {
  status: TopicStatus;
  className?: string;
}) {
  const item = meta[status];
  const Icon = item.icon;
  const color =
    status === "mastered"
      ? "text-ink"
      : status === "practiced"
        ? "text-success"
        : status === "learning"
          ? "text-warning"
          : "text-muted";
  return (
    <Icon
      size={16}
      strokeWidth={1.9}
      className={cn(color, className)}
      role="img"
      aria-label={item.label}
    />
  );
}

export function PlayIcon() {
  return <Play size={12} strokeWidth={2} />;
}

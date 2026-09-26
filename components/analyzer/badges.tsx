import type {
  DependencyPriority,
  DependencyStatus,
} from "@/lib/types/analysis";
import type { VulnerabilitySeverity } from "@/lib/types/dependency";

const priorityStyles: Record<DependencyPriority, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  optional: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export function PriorityBadge({ priority }: { priority: DependencyPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${priorityStyles[priority]}`}
    >
      {priority}
    </span>
  );
}

const statusStyles: Record<DependencyStatus, { label: string; dot: string; text: string }> = {
  vulnerable: { label: "Vulnerable", dot: "bg-red-500", text: "text-red-400" },
  outdated: { label: "Outdated", dot: "bg-orange-500", text: "text-orange-400" },
  current: { label: "Current", dot: "bg-emerald-500", text: "text-emerald-400" },
  incompatible: { label: "Incompatible", dot: "bg-purple-500", text: "text-purple-400" },
  unknown: { label: "Unknown", dot: "bg-zinc-500", text: "text-zinc-400" },
};

export function StatusBadge({ status }: { status: DependencyStatus }) {
  const s = statusStyles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

const severityStyles: Record<VulnerabilitySeverity, string> = {
  CRITICAL: "bg-red-500/10 text-red-400 border-red-500/20",
  HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  MEDIUM: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  LOW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  UNKNOWN: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export function SeverityBadge({ severity }: { severity: string | null }) {
  const key = (severity?.toUpperCase() as VulnerabilitySeverity) || "UNKNOWN";
  const style = severityStyles[key] ?? severityStyles.UNKNOWN;
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${style}`}
    >
      {key}
    </span>
  );
}

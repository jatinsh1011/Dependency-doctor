import type { DependencyAnalysis } from "@/lib/types/analysis";

interface StatCard {
  label: string;
  value: number;
  accent: string;
  emoji: string;
}

export function SummaryCards({ summary }: { summary: DependencyAnalysis["summary"] }) {
  const cards: StatCard[] = [
    { label: "Dependencies", value: summary.totalDependencies, accent: "text-zinc-100", emoji: "📦" },
    { label: "Vulnerable", value: summary.vulnerable, accent: "text-red-400", emoji: "🔴" },
    { label: "Outdated", value: summary.outdated, accent: "text-orange-400", emoji: "🟠" },
    { label: "Major Updates", value: summary.majorUpdates, accent: "text-yellow-400", emoji: "🟡" },
    { label: "Healthy", value: summary.healthy, accent: "text-emerald-400", emoji: "🟢" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-4 transition-colors hover:border-white/[0.15]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {card.label}
            </span>
            <span aria-hidden>{card.emoji}</span>
          </div>
          <p className={`mt-2 text-2xl font-semibold tabular-nums ${card.accent}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}

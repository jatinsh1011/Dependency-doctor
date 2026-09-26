import type { ProgressStepKey } from "@/lib/types/analysis";

export const PROGRESS_STEPS: { key: ProgressStepKey; label: string }[] = [
  { key: "parse", label: "Reading package.json" },
  { key: "extract", label: "Detecting dependencies" },
  { key: "registry", label: "Checking package versions" },
  { key: "vulnerabilities", label: "Checking vulnerabilities" },
  { key: "chains", label: "Analyzing compatibility" },
  { key: "ai", label: "Preparing upgrade plan" },
];

export function AnalysisProgress({ completed }: { completed: Set<ProgressStepKey> }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-6">
      <p className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-300">
        <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
        Analyzing dependencies...
      </p>
      <ul className="space-y-3">
        {PROGRESS_STEPS.map((step) => {
          const done = completed.has(step.key);
          return (
            <li key={step.key} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] transition-colors ${
                  done
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-white/[0.04] text-zinc-600"
                }`}
              >
                {done ? "✓" : "·"}
              </span>
              <span className={done ? "text-zinc-200" : "text-zinc-500"}>{step.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

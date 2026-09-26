import type { UpgradeStep } from "@/lib/types/analysis";
import { SectionHeading } from "@/components/analyzer/SectionHeading";

export function UpgradePlan({ steps }: { steps: UpgradeStep[] }) {
  if (steps.length === 0) return null;
  return (
    <section aria-labelledby="upgrade-plan-heading">
      <SectionHeading id="upgrade-plan-heading">Recommended Upgrade Plan</SectionHeading>
      <ol className="mt-3 divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-[#0c0c0e]">
        {steps.map((step) => (
          <li key={step.step} className="flex gap-4 p-4">
            <span className="font-mono text-sm text-indigo-400/70">
              {String(step.step).padStart(2, "0")}
            </span>
            <div>
              <p className="text-zinc-100">
                Upgrade <span className="font-mono">{step.package}</span>
              </p>
              <p className="font-mono text-sm text-emerald-400">
                {step.from} → {step.to}
              </p>
              <p className="mt-1 text-sm text-zinc-400">{step.reason}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

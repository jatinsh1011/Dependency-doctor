import type { UpgradeChain } from "@/lib/types/analysis";
import { SectionHeading } from "@/components/analyzer/SectionHeading";

export function UpgradeChainSection({ chains }: { chains: UpgradeChain[] }) {
  return (
    <section aria-labelledby="upgrade-chains-heading">
      <SectionHeading id="upgrade-chains-heading">Upgrade Chains</SectionHeading>
      {chains.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">
          Dependency chain could not be confidently determined from package.json alone.
        </p>
      ) : (
        <div className="mt-3 space-y-4">
          {chains.map((chain, i) => (
            <div key={i} className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-4">
              <p className="font-mono text-sm text-zinc-100">{chain.trigger}</p>
              <ol className="mt-2 space-y-1">
                {chain.requiredUpgrades.map((step, j) => (
                  <li key={j} className="flex items-center gap-2 pl-3 text-sm text-zinc-300">
                    <span className="text-zinc-600">↓</span>
                    <span className="font-mono">{step.package}</span>
                    <span className="font-mono text-zinc-500">
                      {step.from} → {step.to}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-sm text-zinc-400">
                <span className="text-zinc-500">Why? </span>
                {chain.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

import type { DependencyFinding } from "@/lib/types/analysis";
import { SeverityBadge } from "@/components/analyzer/badges";

export function DependencyCard({ dependency }: { dependency: DependencyFinding }) {
  return (
    <div className="grid gap-4 text-sm md:grid-cols-2">
      <div>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Reason
        </h4>
        <p className="text-zinc-300">{dependency.reason}</p>

        {dependency.relatedDependencies.length > 0 && (
          <div className="mt-3">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Related dependencies
            </h4>
            <p className="font-mono text-zinc-400">
              {dependency.relatedDependencies.join(", ")}
            </p>
          </div>
        )}
      </div>

      <div>
        {dependency.vulnerability.id && (
          <div className="mb-3">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Vulnerability
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={dependency.vulnerability.severity} />
              <span className="font-mono text-zinc-300">{dependency.vulnerability.id}</span>
            </div>
            <dl className="mt-2 space-y-1 text-zinc-400">
              {dependency.vulnerability.affectedVersions && (
                <div>
                  <dt className="inline text-zinc-500">Affected: </dt>
                  <dd className="inline">{dependency.vulnerability.affectedVersions}</dd>
                </div>
              )}
              {dependency.vulnerability.fixedVersion && (
                <div>
                  <dt className="inline text-zinc-500">Fixed in: </dt>
                  <dd className="inline font-mono">{dependency.vulnerability.fixedVersion}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {dependency.breakingChanges.length > 0 && (
          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Breaking changes
            </h4>
            <ul className="space-y-2">
              {dependency.breakingChanges.map((bc, i) => (
                <li key={i} className="rounded-md border border-white/[0.08] p-2">
                  <p className="text-zinc-200">{bc.change}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Impact: {bc.impact} · Migration: {bc.migration}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

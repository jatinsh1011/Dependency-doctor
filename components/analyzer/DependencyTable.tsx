"use client";

import { Fragment, useState } from "react";
import type { DependencyFinding } from "@/lib/types/analysis";
import { StatusBadge, PriorityBadge } from "@/components/analyzer/badges";
import { DependencyCard } from "@/components/analyzer/DependencyCard";

export function DependencyTable({ dependencies }: { dependencies: DependencyFinding[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-white/[0.08]">
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02] text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 font-medium">Package</th>
              <th className="px-4 py-3 font-medium">Current</th>
              <th className="px-4 py-3 font-medium">Latest</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="bg-[#0c0c0e]">
            {dependencies.map((dep) => {
              const isOpen = expanded === dep.name;
              return (
                <Fragment key={dep.name}>
                  <tr
                    onClick={() => setExpanded(isOpen ? null : dep.name)}
                    className="cursor-pointer border-b border-white/[0.06] last:border-b-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3 font-mono text-zinc-100">{dep.name}</td>
                    <td className="px-4 py-3 font-mono text-zinc-400">{dep.currentVersion}</td>
                    <td className="px-4 py-3 font-mono text-zinc-400">{dep.latestVersion ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={dep.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={dep.priority} />
                    </td>
                    <td className="px-4 py-3 capitalize text-zinc-400">{dep.action}</td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <td colSpan={6} className="px-4 py-4">
                        <DependencyCard dependency={dep} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { MajorUpdate } from "@/lib/types/analysis";
import { SectionHeading } from "@/components/analyzer/SectionHeading";

function MajorUpdateItem({ update }: { update: MajorUpdate }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <span className="font-mono text-zinc-100">{update.package}</span>
          <span className="ml-3 font-mono text-sm text-yellow-400">
            {update.from} → {update.to}
          </span>
        </div>
        <span className="text-xs text-zinc-500">{open ? "Hide" : "Details"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3 border-t border-white/[0.06] pt-3 text-sm">
          <p className="text-zinc-300">{update.reason}</p>
          {update.breakingChanges.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Breaking changes
              </h4>
              <ul className="space-y-2">
                {update.breakingChanges.map((bc, i) => (
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
          {update.relatedDependencies.length > 0 && (
            <p className="font-mono text-xs text-zinc-500">
              Related: {update.relatedDependencies.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function MajorUpdateSection({ updates }: { updates: MajorUpdate[] }) {
  if (updates.length === 0) return null;
  return (
    <section aria-labelledby="major-updates-heading">
      <SectionHeading id="major-updates-heading">Major Updates</SectionHeading>
      <div className="mt-3 space-y-3">
        {updates.map((update) => (
          <MajorUpdateItem key={update.package} update={update} />
        ))}
      </div>
    </section>
  );
}

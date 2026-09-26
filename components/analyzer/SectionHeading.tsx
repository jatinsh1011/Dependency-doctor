import type { ReactNode } from "react";

export function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-zinc-100"
    >
      <span className="h-4 w-1 rounded-full bg-indigo-400/80" />
      {children}
    </h2>
  );
}

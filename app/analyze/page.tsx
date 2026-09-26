import type { Metadata } from "next";
import Link from "next/link";
import { AnalyzerClient } from "@/components/analyzer/AnalyzerClient";

export const metadata: Metadata = {
  title: "Analyze package.json — Dependency Doctor",
  description:
    "Paste a package.json to check for vulnerable dependencies, outdated packages, major upgrades, and get an ordered upgrade plan.",
  alternates: { canonical: "/analyze" },
};

export default function AnalyzePage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-400 to-violet-500 text-[11px] font-bold text-white">
              D
            </span>
            <span className="text-sm font-semibold tracking-tight text-zinc-50">
              Dependency Doctor
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-50"
          >
            ← Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <AnalyzerClient />
      </main>
    </div>
  );
}

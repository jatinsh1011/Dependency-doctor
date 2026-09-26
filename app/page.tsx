import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dependency Doctor — Package.json Analyzer & Dependency Vulnerability Checker",
  description:
    "Paste your package.json and instantly see vulnerabilities, outdated dependencies, upgrade chains, and breaking changes. A trustworthy npm dependency checker and upgrade planner.",
  alternates: { canonical: "/" },
};

const FEATURES = [
  "Security vulnerabilities",
  "Outdated dependencies",
  "Upgrade chains",
  "Breaking changes",
  "Upgrade plan",
];

const EXAMPLES = [
  {
    name: "lodash",
    version: "4.17.15",
    status: "Vulnerable",
    detail: "Fixed in 4.17.21",
    accent: "border-red-500/30 bg-red-500/[0.06]",
    dot: "bg-red-500",
    label: "text-red-400",
  },
  {
    name: "react",
    version: "18.2.0",
    status: "Major update available",
    detail: "18 → 19",
    accent: "border-yellow-500/30 bg-yellow-500/[0.06]",
    dot: "bg-yellow-500",
    label: "text-yellow-400",
  },
  {
    name: "webpack",
    version: "4.46.0",
    status: "Upgrade chain detected",
    detail: "webpack → webpack-dev-server → plugins",
    accent: "border-orange-500/30 bg-orange-500/[0.06]",
    dot: "bg-orange-500",
    label: "text-orange-400",
  },
];

function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-400 to-violet-500 text-[11px] font-bold text-white">
        D
      </span>
      <span className="text-sm font-semibold tracking-tight text-zinc-50">
        Dependency Doctor
      </span>
    </span>
  );
}

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Dependency Doctor",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    description:
      "Paste your package.json and instantly see vulnerabilities, outdated dependencies, upgrade chains, and breaking changes.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background text-zinc-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* ambient glow, purely decorative */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-12rem] -z-10 flex justify-center"
      >
        <div className="h-[28rem] w-[42rem] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo />
          <Link
            href="/analyze"
            className="rounded-md border border-white/10 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/25 hover:text-zinc-50"
          >
            Open Analyzer
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-24 px-6 py-24">
        <section className="flex flex-col items-start gap-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            package.json analyzer &amp; dependency vulnerability checker
          </span>

          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
            Understand your dependencies{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
              before they become a problem.
            </span>
          </h1>

          <p className="max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
            Paste your package.json and instantly see vulnerabilities, outdated dependencies,
            upgrade chains, and breaking changes.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/analyze"
              className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-50 px-6 text-sm font-semibold text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-all hover:bg-zinc-200 hover:shadow-[0_0_24px_rgba(129,140,248,0.35)]"
            >
              Analyze package.json
            </Link>
            <a
              href="#example-heading"
              className="inline-flex h-11 items-center justify-center rounded-md border border-white/10 px-5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/25 hover:text-zinc-50"
            >
              See an example
            </a>
          </div>

          <ul className="mt-2 flex flex-wrap gap-2">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1 text-xs font-medium text-zinc-400"
              >
                <span className="text-emerald-400">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="example-heading">
          <h2
            id="example-heading"
            className="scroll-mt-24 text-xs font-semibold uppercase tracking-widest text-zinc-500"
          >
            Example findings
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {EXAMPLES.map((example) => (
              <div
                key={example.name}
                className={`rounded-xl border p-5 transition-transform hover:-translate-y-0.5 ${example.accent}`}
              >
                <p className="font-mono text-sm text-zinc-100">
                  {example.name}{" "}
                  <span className="text-zinc-500">{example.version}</span>
                </p>
                <p className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${example.label}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${example.dot}`} />
                  {example.status}
                </p>
                <p className="mt-1 font-mono text-xs text-zinc-500">{example.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-zinc-600">
          Dependency Doctor analyzes package.json declarations. No accounts, no data storage.
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
import { PackageEditor } from "@/components/analyzer/PackageEditor";
import { AnalyzeButton } from "@/components/analyzer/AnalyzeButton";
import { AnalysisProgress } from "@/components/analyzer/AnalysisProgress";
import { ErrorBanner } from "@/components/analyzer/ErrorBanner";
import { AnalysisDashboard } from "@/components/analyzer/AnalysisDashboard";
import { EXAMPLE_PACKAGE_JSON } from "@/lib/example-package";
import type { AnalyzeStreamEvent, DependencyAnalysis, ProgressStepKey } from "@/lib/types/analysis";

const GENERIC_FETCH_ERROR = "We couldn't retrieve dependency information right now. Please try again.";

export function AnalyzerClient() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DependencyAnalysis | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<ProgressStepKey>>(new Set());

  function handleLoadExample() {
    setText(EXAMPLE_PACKAGE_JSON);
  }

  async function handleAnalyze() {
    if (!text.trim()) {
      setError("Paste your package.json to begin.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCompletedSteps(new Set());

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageJsonText: text }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        setError(data?.error || GENERIC_FETCH_ERROR);
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event: AnalyzeStreamEvent = JSON.parse(line);
          if (event.type === "progress") {
            setCompletedSteps((prev) => new Set(prev).add(event.step));
          } else if (event.type === "result") {
            setResult(event.data);
          } else if (event.type === "error") {
            setError(event.message);
          }
        }
      }
    } catch {
      setError(GENERIC_FETCH_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          Paste your package.json
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Analysis is based on declared version ranges only. For exact installed/transitive
          dependency analysis, provide a lockfile in a future version.
        </p>
      </div>

      <PackageEditor value={text} onChange={setText} onLoadExample={handleLoadExample} />

      <AnalyzeButton onClick={handleAnalyze} loading={loading} disabled={!text.trim()} />

      {error && <ErrorBanner message={error} />}

      {loading && <AnalysisProgress completed={completedSteps} />}

      {result && <AnalysisDashboard analysis={result} />}
    </div>
  );
}

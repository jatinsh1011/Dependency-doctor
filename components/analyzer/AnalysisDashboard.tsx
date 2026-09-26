import type { DependencyAnalysis } from "@/lib/types/analysis";
import { SummaryCards } from "@/components/analyzer/SummaryCards";
import { DependencyTable } from "@/components/analyzer/DependencyTable";
import { VulnerabilitySection } from "@/components/analyzer/VulnerabilitySection";
import { MajorUpdateSection } from "@/components/analyzer/MajorUpdateSection";
import { UpgradeChainSection } from "@/components/analyzer/UpgradeChainSection";
import { UpgradePlan } from "@/components/analyzer/UpgradePlan";
import { SectionHeading } from "@/components/analyzer/SectionHeading";

export function AnalysisDashboard({ analysis }: { analysis: DependencyAnalysis }) {
  return (
    <div className="space-y-10 border-t border-white/[0.06] pt-10">
      <section aria-labelledby="dependency-health-heading">
        <SectionHeading id="dependency-health-heading">Dependency Health</SectionHeading>
        <p className="mt-1 text-sm text-zinc-500">
          Based on declared version ranges. For exact installed/transitive dependency analysis,
          provide a lockfile in a future version.
        </p>
        <div className="mt-3">
          <SummaryCards summary={analysis.summary} />
        </div>
      </section>

      <VulnerabilitySection dependencies={analysis.dependencies} />

      <section aria-labelledby="dependencies-heading">
        <SectionHeading id="dependencies-heading">Dependencies</SectionHeading>
        <div className="mt-3">
          <DependencyTable dependencies={analysis.dependencies} />
        </div>
      </section>

      <MajorUpdateSection updates={analysis.majorUpdates} />

      <UpgradeChainSection chains={analysis.upgradeChains} />

      <UpgradePlan steps={analysis.recommendedUpgradePlan} />

      <section aria-labelledby="overall-assessment-heading">
        <SectionHeading id="overall-assessment-heading">Overall Assessment</SectionHeading>
        <p className="mt-3 whitespace-pre-line rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-4 text-sm leading-6 text-zinc-300">
          {analysis.overallAssessment}
        </p>
      </section>
    </div>
  );
}
